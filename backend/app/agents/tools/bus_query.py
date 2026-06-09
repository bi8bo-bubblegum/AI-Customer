from datetime import datetime, date as date_type
from langchain_core.tools import tool
from app.database import async_session_factory
from app.models import BusSchedule
from app.repositories.bus_route_repo import BusRouteRepo, BusScheduleRepo


DAYS_MAP = {"1": "周一", "2": "周二", "3": "周三", "4": "周四", "5": "周五", "6": "周六", "7": "周日"}

# 时间段预设
TIME_PERIODS = {
    "早上": ("06:00", "09:00"),
    "上午": ("09:00", "12:00"),
    "中午": ("11:00", "14:00"),
    "下午": ("12:00", "18:00"),
    "晚上": ("18:00", "22:00"),
    "夜间": ("22:00", "06:00"),
}


def _parse_date(date_str: str) -> date_type | None:
    """解析日期字符串，支持标准格式和中文相对日期"""
    from datetime import timedelta

    today = date_type.today()

    # 中文相对日期
    relative_dates = {
        "今天": today,
        "明天": today + timedelta(days=1),
        "后天": today + timedelta(days=2),
        "大后天": today + timedelta(days=3),
    }
    if date_str in relative_dates:
        return relative_dates[date_str]

    # 标准日期格式
    for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%m月%d日", "%m-%d"):
        try:
            dt = datetime.strptime(date_str, fmt)
            # 如果没有年份，用今年
            if fmt in ("%m月%d日", "%m-%d"):
                return dt.date().replace(year=today.year)
            return dt.date()
        except ValueError:
            continue

    return None


def _format_schedule(s: BusSchedule) -> str:
    """格式化单条班次信息"""
    days = "、".join(DAYS_MAP.get(d, d) for d in s.operating_days.split(","))
    return (
        f"  - {s.departure_time.strftime('%H:%M')}出发 → {s.arrival_time.strftime('%H:%M')}到达 | "
        f"{s.bus_type} | 票价¥{s.price} | 余票{s.available_seats}/{s.total_seats} | 运营：{days}\n"
    )


@tool
async def search_bus_info(
    departure: str = None,
    destination: str = None,
    date: str = None,
    time_period: str = None,
) -> str:
    """查询道路客运班次信息，包括线路、班次时刻、票价、余票等。

    Args：
        departure: 出发站名称（模糊匹配），如"北京"
        destination: 目的站名称（模糊匹配），如"天津"
        date: 出发日期，格式 YYYY-MM-DD，如"2025-01-15"。也可以是"明天"、"后天"等相对日期
        time_period: 时间段偏好，可选值：早上、上午、中午、下午、晚上、夜间

    典型用法：
    - "有没有从北京到天津的票" → departure="北京", destination="天津"
    - "明天早上从北京到天津的票" → departure="北京", destination="天津", date="2026.06.07", time_period="早上"
    - "下午从上海到杭州" → departure="上海", destination="杭州", time_period="下午"
    """
    async with async_session_factory() as db:
        # 1. 搜索线路
        routes = await BusRouteRepo.search_routes(db, departure, destination)
        if not routes:
            return f"未找到从 {departure or '?'} 到 {destination or '?'} 的线路"

        # 2. 解析日期 → 星期几
        weekday = None
        date_desc = ""
        if date:
            target_date = _parse_date(date)
            if target_date:
                weekday = target_date.isoweekday()  # 1=周一, 7=周日
                date_desc = f"{target_date.strftime('%Y-%m-%d')}（{DAYS_MAP[str(weekday)]}）"
            else:
                date_desc = date

        # 3. 解析时间段
        time_after = None
        time_before = None
        time_desc = ""
        if time_period and time_period in TIME_PERIODS:
            time_after, time_before = TIME_PERIODS[time_period]
            time_desc = f"{time_period}（{time_after}-{time_before}）"

        # 4. 查询所有匹配线路的班次
        result_parts = []
        total_schedules = 0

        for route in routes:
            schedules = await BusScheduleRepo.search_schedules(
                db,
                route_id=route.id,
                weekday=weekday,
                time_after=time_after,
                time_before=time_before,
            )

            if not schedules:
                continue

            total_schedules += len(schedules)
            route_info = f"线路：{route.route_name}（{route.departure_station} → {route.arrival_station}）"
            if route.distance_km:
                route_info += f" | {route.distance_km}公里"
            if route.duration_minutes:
                route_info += f" | 约{route.duration_minutes}分钟"
            route_info += "\n"

            schedule_info = ""
            for s in schedules:
                schedule_info += _format_schedule(s)

            result_parts.append(route_info + schedule_info)

        # 5. 组装结果
        if not result_parts:
            header = "查询条件："
            conditions = []
            if date_desc:
                conditions.append(f"日期 {date_desc}")
            if time_desc:
                conditions.append(time_desc)
            if departure or destination:
                conditions.append(f"{departure or '?'} → {destination or '?'}")
            header += "、".join(conditions)

            return f"{header}\n未找到符合条件的班次。请尝试调整日期或时间段。"

        header = f"找到 {total_schedules} 个班次"
        conditions = []
        if date_desc:
            conditions.append(f"日期 {date_desc}")
        if time_desc:
            conditions.append(time_desc)
        if conditions:
            header += f"（{'、'.join(conditions)}）"

        return header + "\n\n" + "\n".join(result_parts)