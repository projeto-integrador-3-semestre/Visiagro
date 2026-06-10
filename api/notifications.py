import os
import smtplib
import time
import math
import logging
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from email.utils import formataddr
from io import BytesIO
from typing import Optional
from urllib.request import Request, urlopen

from PIL import Image, ImageDraw, ImageFont

logger = logging.getLogger("visiagro.notifications")
logger.addHandler(logging.NullHandler())

TILE_SIZE = 256

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT") or 0)
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD") or os.getenv("EMAIL_PASSWORLD")


def _resolve_email_from() -> str | None:
    raw_from = (os.getenv("EMAIL_FROM") or "").strip()
    if not raw_from:
        return SMTP_USER
    if "<" in raw_from and ">" in raw_from:
        return raw_from
    if "@" in raw_from and " " not in raw_from:
        return raw_from
    if SMTP_USER and raw_from.endswith(SMTP_USER):
        display_name = raw_from[: -len(SMTP_USER)].strip() or "Visiagro"
        return formataddr((display_name, SMTP_USER))
    return raw_from


EMAIL_FROM = _resolve_email_from()


def email_status() -> dict:
    return {
        "configured": bool(SMTP_HOST and SMTP_PORT and SMTP_USER and SMTP_PASSWORD and EMAIL_FROM),
        "host": SMTP_HOST,
        "port": SMTP_PORT or None,
        "user_configured": bool(SMTP_USER),
        "from_configured": bool(EMAIL_FROM),
    }


def _build_message(subject: str, to: str, plain: str, html: Optional[str] = None) -> EmailMessage:
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = EMAIL_FROM
    msg["To"] = to
    msg.set_content(plain)
    if html:
        msg.add_alternative(html, subtype="html")
    return msg


def send_smtp_email(
    to: Optional[str] = None,
    subject: Optional[str] = None,
    plain: Optional[str] = None,
    html: Optional[str] = None,
    msg: Optional[EmailMessage] = None,
) -> None:
    """Send an email using configured SMTP server. Accepts either raw fields or a prebuilt `EmailMessage` via `msg`."""
    if not SMTP_HOST or not SMTP_PORT or not SMTP_USER or not SMTP_PASSWORD:
        raise RuntimeError("SMTP settings not configured (SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASSWORD).")

    if msg is None:
        if not to or subject is None or plain is None:
            raise RuntimeError("Missing parameters to build message")
        msg = _build_message(subject, to, plain, html)

    if SMTP_PORT == 465:
        server = smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=10)
    else:
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10)
    try:
        server.ehlo()
        if SMTP_PORT != 465:
            server.starttls()
            server.ehlo()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)
        logger.info("Email sent to %s subject=%s", msg.get_all("To"), msg.get("Subject"))
    finally:
        try:
            server.quit()
        except Exception:
            pass


def send_prediction_email(recipient_email: str, payload: dict, prediction: dict, image_bytes: Optional[bytes] = None) -> None:
    """Send a rich HTML email about a prediction, optionally embedding the detected image inline."""
    subject = f"Visiagro: Detecção - {payload.get('label', 'Praga detectada')}"
    confidence = _format_confidence(payload.get("confianca"))
    filename = payload.get("filename")
    plain = f"Detectamos: {payload.get('label')}\nConfianca: {confidence}\nArquivo: {filename}\n"

    # Simple brand colors from app (dark header + green accent)
    header_color = "#0a1a0a"
    accent = "#28a745"

    img_html = ""
    cid = "detected_image"
    if image_bytes:
        img_html = (
            f'<div style="text-align:center;margin:12px 0;">'
            f'<img src="cid:{cid}" alt="detected" style="max-width:100%;height:auto;border-radius:12px;border:1px solid #e6e6e6"/>'
            f'</div>'
        )

    html = f"""
    <div style="font-family:Inter,Arial,Helvetica,sans-serif;color:#111;line-height:1.4">
      <div style="background:{header_color};color:white;padding:14px 18px;border-radius:8px 8px 0 0;">
        <h2 style="margin:0;font-size:18px">Visiagro</h2>
        <div style="font-size:12px;opacity:0.9">Alerta de detecção de praga</div>
      </div>
      <div style="padding:16px;border:1px solid #f0f0f0;border-top:none;border-radius:0 0 8px 8px;background:#fff">
        <h3 style="margin:0 0 8px 0;color:{accent}">{payload.get('label')}</h3>
        <p style="margin:0 0 8px 0">Confianca: <strong>{confidence}</strong></p>
        <p style="margin:0 0 12px 0">Arquivo: {filename}</p>
        {img_html}
        <p style="margin:12px 0 0 0;font-size:13px;color:#555">Abra o aplicativo para ver detalhes e recomendações.</p>
      </div>
    </div>
    """

    # build message
    msg = _build_message(subject, recipient_email, plain, html)

    # attach inline image if present
    if image_bytes:
        try:
            # attach inline to HTML part if available
            # the plain text is payload[0], the html alternative is payload[1]
            payload_parts = msg.get_payload()
            if isinstance(payload_parts, list) and len(payload_parts) > 1:
                html_part = payload_parts[1]
                try:
                    html_part.add_related(image_bytes, maintype="image", subtype="png", cid=f"<{cid}>")
                except Exception:
                    # fallback: attach normally
                    msg.add_attachment(image_bytes, maintype="image", subtype="png", filename=(filename or "detected.png"))
            else:
                # no html part available, attach as normal
                msg.add_attachment(image_bytes, maintype="image", subtype="png", filename=(filename or "detected.png"))
        except Exception:
            try:
                msg.add_attachment(image_bytes, maintype="image", subtype="png", filename=(filename or "detected.png"))
            except Exception:
                logger.exception("Failed to attach image to message")

    # send (use prebuilt message so attachments are preserved)
    send_smtp_email(msg=msg)


def _haversine_km(a_lat, a_lng, b_lat, b_lng):
    # returns distance in kilometers
    r = 6371
    lat1 = math.radians(a_lat)
    lat2 = math.radians(b_lat)
    dlat = math.radians(b_lat - a_lat)
    dlng = math.radians(b_lng - a_lng)
    hav = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng / 2) ** 2
    return r * 2 * math.atan2(math.sqrt(hav), math.sqrt(1 - hav))


def _bearing_deg(a_lat, a_lng, b_lat, b_lng):
    lat1 = math.radians(a_lat)
    lat2 = math.radians(b_lat)
    dlng = math.radians(b_lng - a_lng)
    y = math.sin(dlng) * math.cos(lat2)
    x = math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(dlng)
    return (math.degrees(math.atan2(y, x)) + 360) % 360


def _destination_coordinate(lat, lng, distance_km, bearing_deg):
    radius_km = 6371
    bearing = math.radians(bearing_deg)
    lat1 = math.radians(lat)
    lng1 = math.radians(lng)
    angular = distance_km / radius_km
    lat2 = math.asin(
        math.sin(lat1) * math.cos(angular)
        + math.cos(lat1) * math.sin(angular) * math.cos(bearing)
    )
    lng2 = lng1 + math.atan2(
        math.sin(bearing) * math.sin(angular) * math.cos(lat1),
        math.cos(angular) - math.sin(lat1) * math.sin(lat2),
    )
    return {
        "latitude": round(math.degrees(lat2), 5),
        "longitude": round(math.degrees(lng2), 5),
    }


def _approximate_alert_region(pest_lat, pest_lng, farm_lat, farm_lng, farm_radius_km, distance_km):
    area_radius_km = min(max(float(farm_radius_km) * 0.25, 1.0), 3.0)
    bearing = _bearing_deg(float(farm_lat), float(farm_lng), float(pest_lat), float(pest_lng))
    bucket_km = max(area_radius_km, round(float(distance_km) / area_radius_km) * area_radius_km)
    center = _destination_coordinate(float(farm_lat), float(farm_lng), bucket_km, bearing)
    return center["latitude"], center["longitude"], round(area_radius_km, 2)


def _latlng_to_pixel(lat, lng, zoom):
    sin_lat = math.sin(math.radians(max(min(lat, 85.05112878), -85.05112878)))
    scale = TILE_SIZE * (2**zoom)
    x = (lng + 180.0) / 360.0 * scale
    y = (0.5 - math.log((1 + sin_lat) / (1 - sin_lat)) / (4 * math.pi)) * scale
    return x, y


def _km_to_pixels(km, lat, zoom):
    meters_per_pixel = 156543.03392 * math.cos(math.radians(lat)) / (2**zoom)
    if meters_per_pixel <= 0:
        return 0
    return (float(km) * 1000) / meters_per_pixel


def _choose_static_map_zoom(farm_lat, farm_lng, farm_radius_km, region_lat, region_lng, area_radius_km, width, height):
    for zoom in range(13, 5, -1):
        fx, fy = _latlng_to_pixel(farm_lat, farm_lng, zoom)
        rx, ry = _latlng_to_pixel(region_lat, region_lng, zoom)
        area_r = _km_to_pixels(area_radius_km, region_lat, zoom)
        min_x = min(fx, rx - area_r)
        max_x = max(fx, rx + area_r)
        min_y = min(fy, ry - area_r)
        max_y = max(fy, ry + area_r)
        if (max_x - min_x) <= width * 0.78 and (max_y - min_y) <= height * 0.72:
            return zoom
    return 6


def _load_tile(tile_x, tile_y, zoom):
    max_tile = 2**zoom
    if tile_y < 0 or tile_y >= max_tile:
        return None
    tile_x = tile_x % max_tile
    url = f"https://tile.openstreetmap.org/{zoom}/{tile_x}/{tile_y}.png"
    try:
        request = Request(url, headers={"User-Agent": "Visiagro/1.0"})
        with urlopen(request, timeout=5) as response:
            return Image.open(BytesIO(response.read())).convert("RGB")
    except Exception:
        return None


def _fallback_tile(width, height):
    image = Image.new("RGB", (width, height), "#e8efe2")
    draw = ImageDraw.Draw(image, "RGBA")
    for x in range(-80, width, 120):
        draw.line((x, 0, x + 180, height), fill=(190, 205, 180, 180), width=8)
        draw.line((x, 0, x + 180, height), fill=(255, 255, 255, 210), width=3)
    for y in range(30, height, 92):
        draw.line((0, y, width, y + 28), fill=(175, 195, 168, 170), width=7)
        draw.line((0, y, width, y + 28), fill=(255, 255, 255, 220), width=3)
    for x in range(20, width, 160):
        draw.rectangle((x, 40, x + 70, 112), fill=(205, 226, 190, 130), outline=(160, 190, 145, 100))
    return image


def _draw_circle(draw, center, radius, outline, fill, width=3, dash=False):
    x, y = center
    box = (x - radius, y - radius, x + radius, y + radius)
    draw.ellipse(box, fill=fill)
    if not dash:
        draw.ellipse(box, outline=outline, width=width)
        return
    steps = 96
    for i in range(0, steps, 2):
        start = int(i * 360 / steps)
        end = int((i + 1) * 360 / steps)
        draw.arc(box, start=start, end=end, fill=outline, width=width)


def _load_font(size=14, bold=False):
    candidates = [
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
    ]
    for path in candidates:
        try:
            if os.path.exists(path):
                return ImageFont.truetype(path, size=size)
        except Exception:
            pass
    return ImageFont.load_default()


def _draw_pin(draw, point, color="#20d326"):
    x, y = point
    draw.ellipse((x - 22, y - 50, x + 22, y - 6), fill=(32, 211, 38, 245), outline="#cfff1a", width=4)
    draw.polygon([(x - 13, y - 12), (x + 13, y - 12), (x, y + 18)], fill=(32, 211, 38, 245))
    draw.ellipse((x - 7, y - 35, x + 7, y - 21), fill="#f7fff0")


def _text_size(draw, text, font):
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox[2] - bbox[0], bbox[3] - bbox[1]


def _draw_label(draw, x, y, title, subtitle=None, accent="#cfff1a"):
    font_bold = _load_font(15, True)
    font = _load_font(13)
    title_w, title_h = _text_size(draw, title, font_bold)
    sub_w, sub_h = _text_size(draw, subtitle or "", font)
    width = max(title_w, sub_w) + 24
    height = title_h + (sub_h + 6 if subtitle else 0) + 16
    x0 = max(12, min(x, 900 - width - 12))
    y0 = max(12, min(y, 520 - height - 12))
    draw.rounded_rectangle((x0, y0, x0 + width, y0 + height), radius=10, fill=(5, 13, 6, 232), outline=accent, width=2)
    draw.text((x0 + 12, y0 + 8), title, fill="#eaffea", font=font_bold)
    if subtitle:
        draw.text((x0 + 12, y0 + title_h + 13), subtitle, fill="#b8d8b5", font=font)


def _format_confidence(confidence):
    try:
        value = float(confidence)
        return f"{value * 100:.2f}%" if value <= 1 else f"{value:.2f}%"
    except Exception:
        return "Nao informado"


def _extract_admin_user_email(admin_resp) -> Optional[str]:
    user_obj = getattr(admin_resp, "user", None) or admin_resp
    if not user_obj:
        return None
    if isinstance(user_obj, dict):
        return user_obj.get("email")
    email = getattr(user_obj, "email", None)
    if email:
        return email
    model_dump = getattr(user_obj, "model_dump", None)
    if callable(model_dump):
        try:
            return model_dump().get("email")
        except Exception:
            return None
    to_dict = getattr(user_obj, "dict", None)
    if callable(to_dict):
        try:
            return to_dict().get("email")
        except Exception:
            return None
    return None


def _find_recent_duplicate_public_alert(supabase_client, public_alert: dict, recent_hours: int = 24) -> Optional[dict]:
    target_farm_id = public_alert.get("target_farm_id")
    label = public_alert.get("label")
    if not target_farm_id or not label:
        return None

    since = (datetime.now(timezone.utc) - timedelta(hours=recent_hours)).isoformat()
    try:
        resp = (
            supabase_client.table("alertas_publicos")
            .select("id,prediction_id,label,latitude,longitude,area_radius_km,notified_email_at,created_at")
            .eq("target_farm_id", target_farm_id)
            .eq("label", label)
            .gte("created_at", since)
            .order("created_at", desc=True)
            .limit(30)
            .execute()
        )
    except Exception:
        logger.debug("Nao foi possivel consultar duplicidade de alerta publico", exc_info=True)
        return None

    region_lat = public_alert.get("latitude")
    region_lng = public_alert.get("longitude")
    if region_lat is None or region_lng is None:
        return None

    for existing in resp.data or []:
        try:
            existing_radius = float(existing.get("area_radius_km") or 1.5)
            new_radius = float(public_alert.get("area_radius_km") or 1.5)
            threshold_km = max(0.25, min(max(existing_radius, new_radius) * 0.25, 0.75))
            distance = _haversine_km(
                float(region_lat),
                float(region_lng),
                float(existing.get("latitude")),
                float(existing.get("longitude")),
            )
            if distance <= threshold_km:
                return existing
        except Exception:
            continue
    return None


def _find_duplicate_public_alert(supabase_client, public_alert: dict) -> Optional[dict]:
    target_farm_id = public_alert.get("target_farm_id")
    label = public_alert.get("label")
    if not target_farm_id or not label:
        return None

    try:
        resp = (
            supabase_client.table("alertas_publicos")
            .select("id,prediction_id,label,latitude,longitude,area_radius_km,notified_email_at,created_at")
            .eq("target_farm_id", target_farm_id)
            .eq("label", label)
            .order("created_at", desc=True)
            .limit(100)
            .execute()
        )
    except Exception:
        logger.debug("Nao foi possivel consultar duplicidade historica de alerta publico", exc_info=True)
        return None

    region_lat = public_alert.get("latitude")
    region_lng = public_alert.get("longitude")
    if region_lat is None or region_lng is None:
        return None

    for existing in resp.data or []:
        try:
            existing_radius = float(existing.get("area_radius_km") or 1.5)
            new_radius = float(public_alert.get("area_radius_km") or 1.5)
            threshold_km = max(0.25, min(max(existing_radius, new_radius) * 0.25, 0.75))
            distance = _haversine_km(
                float(region_lat),
                float(region_lng),
                float(existing.get("latitude")),
                float(existing.get("longitude")),
            )
            if distance <= threshold_km:
                return existing
        except Exception:
            continue
    return None


def _save_public_alert_without_email(supabase_client, public_alert: dict) -> bool:
    duplicate_alert = _find_duplicate_public_alert(supabase_client, public_alert)

    if duplicate_alert:
        update_payload = {
            "source_user_id": public_alert.get("source_user_id"),
            "prediction_id": public_alert.get("prediction_id"),
            "confianca": public_alert.get("confianca"),
            "nivel_risco": public_alert.get("nivel_risco"),
            "recomendacao": public_alert.get("recomendacao"),
            "distance_km": public_alert.get("distance_km"),
            "area_radius_km": duplicate_alert.get("area_radius_km") or public_alert.get("area_radius_km"),
        }
        try:
            supabase_client.table("alertas_publicos").update(update_payload).eq("id", duplicate_alert["id"]).execute()
        except Exception:
            logger.debug("Nao foi possivel atualizar alerta publico historico duplicado", exc_info=True)
        return False

    try:
        supabase_client.table("alertas_publicos").insert(public_alert).execute()
        return True
    except Exception:
        logger.exception("Erro ao inserir alerta publico historico para lavoura %s", public_alert.get("target_farm_id"))
        return False


def _farm_boundary_points(farm):
    boundary = farm.get("boundary")
    if not isinstance(boundary, list):
        return []
    points = []
    for point in boundary:
        try:
            lat = point.get("lat")
            lng = point.get("lng")
            if lat is None or lng is None:
                continue
            points.append((float(lat), float(lng)))
        except Exception:
            continue
    return points


def _build_alert_map_image(farm, alert, payload):
    width, height = 900, 520
    farm_lat = float(farm["latitude"])
    farm_lng = float(farm["longitude"])
    region_lat = float(alert["latitude"])
    region_lng = float(alert["longitude"])
    farm_radius_km = float(farm.get("raio_alerta_km") or 5)
    area_radius_km = float(alert.get("area_radius_km") or 1.5)
    zoom = _choose_static_map_zoom(farm_lat, farm_lng, farm_radius_km, region_lat, region_lng, area_radius_km, width, height)

    farm_px = _latlng_to_pixel(farm_lat, farm_lng, zoom)
    region_px = _latlng_to_pixel(region_lat, region_lng, zoom)
    center_px = ((farm_px[0] + region_px[0]) / 2, (farm_px[1] + region_px[1]) / 2)
    top_left = (center_px[0] - width / 2, center_px[1] - height / 2)

    canvas = Image.new("RGB", (width, height), "#071407")
    first_tile_x = math.floor(top_left[0] / TILE_SIZE)
    first_tile_y = math.floor(top_left[1] / TILE_SIZE)
    last_tile_x = math.floor((top_left[0] + width) / TILE_SIZE)
    last_tile_y = math.floor((top_left[1] + height) / TILE_SIZE)
    loaded_any = False
    for tx in range(first_tile_x, last_tile_x + 1):
        for ty in range(first_tile_y, last_tile_y + 1):
            tile = _load_tile(tx, ty, zoom)
            if tile is None:
                continue
            loaded_any = True
            canvas.paste(tile, (int(tx * TILE_SIZE - top_left[0]), int(ty * TILE_SIZE - top_left[1])))

    if not loaded_any:
        canvas = _fallback_tile(width, height)

    overlay = Image.new("RGBA", (width, height), (4, 12, 5, 18))
    canvas = Image.alpha_composite(canvas.convert("RGBA"), overlay)
    def project(lat, lng):
        px, py = _latlng_to_pixel(float(lat), float(lng), zoom)
        return px - top_left[0], py - top_left[1]

    farm_point = project(farm_lat, farm_lng)
    region_point = project(region_lat, region_lng)
    farm_radius_px = _km_to_pixels(farm_radius_km, farm_lat, zoom)
    area_radius_px = _km_to_pixels(area_radius_km, region_lat, zoom)
    boundary_points = [project(lat, lng) for lat, lng in _farm_boundary_points(farm)]

    shape_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    shape_draw = ImageDraw.Draw(shape_layer, "RGBA")

    _draw_circle(shape_draw, farm_point, farm_radius_px, outline=(32, 211, 38, 215), fill=(32, 211, 38, 24), width=3, dash=True)
    if len(boundary_points) >= 3:
        shape_draw.polygon(boundary_points, fill=(32, 211, 38, 48), outline=(207, 255, 26, 245))
        shape_draw.line(boundary_points + [boundary_points[0]], fill=(207, 255, 26, 245), width=4, joint="curve")
        for x, y in boundary_points:
            shape_draw.ellipse((x - 6, y - 6, x + 6, y + 6), fill=(5, 13, 6, 245), outline=(207, 255, 26, 245), width=3)
    elif len(boundary_points) == 2:
        shape_draw.line(boundary_points, fill=(207, 255, 26, 245), width=4)
        for x, y in boundary_points:
            shape_draw.ellipse((x - 6, y - 6, x + 6, y + 6), fill=(5, 13, 6, 245), outline=(207, 255, 26, 245), width=3)

    _draw_circle(shape_draw, region_point, area_radius_px, outline=(255, 184, 0, 245), fill=(255, 184, 0, 48), width=3, dash=True)
    canvas = Image.alpha_composite(canvas, shape_layer)
    draw = ImageDraw.Draw(canvas, "RGBA")

    _draw_pin(draw, farm_point, "#20d326")
    _draw_label(draw, farm_point[0] + 24, farm_point[1] + 8, "Sua lavoura", f"Raio de alerta: {farm_radius_km:g} km", "#20d326")
    _draw_label(draw, region_point[0] + 18, region_point[1] - 24, payload.get("label") or "Praga detectada", "Regiao provavel", "#ffb800")

    buf = BytesIO()
    canvas.convert("RGB").save(buf, format="PNG")
    return buf.getvalue()


def notify_nearby_farms(
    supabase_client,
    payload: dict,
    prediction: dict,
    image_bytes: Optional[bytes] = None,
    max_retries: int = 3,
) -> None:
    """Find farms near the prediction and notify owners who opted in.

    This function will try to query `lavouras` and then `profiles` to obtain owner emails.
    It tolerates missing profile emails and logs accordingly.
    """
    try:
        if supabase_client is None:
            logger.warning("Supabase service client not configured; skipping nearby farm alerts.")
            return

        lat = prediction.get("latitude") or prediction.get("lat")
        lng = prediction.get("longitude") or prediction.get("lng")
        if prediction.get("ativa") is False:
            logger.info("Prediction %s is inactive, skipping nearby notifications.", prediction.get("id"))
            return
        if lat is None or lng is None:
            logger.info("Prediction has no coordinates, skipping nearby notifications.")
            return

        source_user_id = prediction.get("user_id") or payload.get("user_id")

        # Fetch every farm using the service role client. The normal anon client cannot do this
        # because lavouras is protected by RLS per owner.
        resp = supabase_client.table("lavouras").select("*").execute()
        farms = resp.data or []

        targets = []
        for farm in farms:
            try:
                user_id = farm.get("user_id")
                if source_user_id and user_id == source_user_id:
                    continue
                farm_lat = farm.get("latitude")
                farm_lng = farm.get("longitude")
                if farm_lat is None or farm_lng is None:
                    continue
                radius_km = float(farm.get("raio_alerta_km") or farm.get("radius") or 5)
                dist = _haversine_km(float(lat), float(lng), float(farm_lat), float(farm_lng))
                if dist <= radius_km:
                    region_lat, region_lng, area_radius_km = _approximate_alert_region(
                        float(lat),
                        float(lng),
                        float(farm_lat),
                        float(farm_lng),
                        radius_km,
                        dist,
                    )
                    targets.append((farm, dist, region_lat, region_lng, area_radius_km))
            except Exception:
                logger.exception("Erro ao avaliar lavoura para notificacao: %s", farm.get("id"))

        logger.info("Found %d target farms for prediction %s", len(targets), prediction.get("id"))

        for farm, dist, region_lat, region_lng, area_radius_km in targets:
            user_id = farm.get("user_id")
            if not user_id:
                continue

            public_alert = {
                "target_user_id": user_id,
                "target_farm_id": farm.get("id"),
                "source_user_id": source_user_id,
                "prediction_id": str(prediction.get("id")) if isinstance(prediction, dict) and prediction.get("id") is not None else None,
                "label": payload.get("label"),
                "confianca": payload.get("confianca"),
                "latitude": region_lat,
                "longitude": region_lng,
                "nivel_risco": payload.get("nivel_risco") or "medio",
                "recomendacao": payload.get("recomendacao") or "Abra o catálogo de pragas para ver recomendações cadastradas.",
                "distance_km": round(dist, 3),
                "area_radius_km": area_radius_km,
            }
            duplicate_alert = _find_recent_duplicate_public_alert(supabase_client, public_alert)
            should_send_email = True

            if duplicate_alert:
                should_send_email = not duplicate_alert.get("notified_email_at")
                public_alert["id"] = duplicate_alert.get("id")
                public_alert["latitude"] = duplicate_alert.get("latitude") or public_alert["latitude"]
                public_alert["longitude"] = duplicate_alert.get("longitude") or public_alert["longitude"]
                public_alert["area_radius_km"] = duplicate_alert.get("area_radius_km") or public_alert["area_radius_km"]
                update_payload = {
                    "source_user_id": public_alert.get("source_user_id"),
                    "prediction_id": public_alert.get("prediction_id"),
                    "confianca": public_alert.get("confianca"),
                    "nivel_risco": public_alert.get("nivel_risco"),
                    "recomendacao": public_alert.get("recomendacao"),
                    "distance_km": public_alert.get("distance_km"),
                    "area_radius_km": public_alert.get("area_radius_km"),
                }
                try:
                    supabase_client.table("alertas_publicos").update(update_payload).eq("id", duplicate_alert["id"]).execute()
                    logger.info(
                        "Alerta publico duplicado atualizado para lavoura %s (%s)",
                        farm.get("id"),
                        public_alert.get("label"),
                    )
                except Exception:
                    logger.exception("Erro ao atualizar alerta publico duplicado para lavoura %s", farm.get("id"))
            else:
                try:
                    saved_resp = supabase_client.table("alertas_publicos").insert(public_alert).execute()
                    saved_alert = (saved_resp.data or [None])[0]
                    if isinstance(saved_alert, dict):
                        public_alert = {**public_alert, **saved_alert}
                except Exception:
                    logger.exception("Erro ao inserir alerta publico para lavoura %s", farm.get("id"))
                    try:
                        saved_resp = supabase_client.table("alertas_publicos").upsert(
                            public_alert,
                            on_conflict="target_farm_id,prediction_id",
                        ).execute()
                        saved_alert = (saved_resp.data or [None])[0]
                        if isinstance(saved_alert, dict):
                            public_alert = {**public_alert, **saved_alert}
                    except Exception:
                        logger.exception("Erro ao criar/atualizar alerta publico para lavoura %s", farm.get("id"))

            if not should_send_email:
                logger.info(
                    "Email de alerta ja enviado para lavoura %s na mesma regiao/praga; pulando repeticao.",
                    farm.get("id"),
                )
                continue

            if not farm.get("receber_email", True):
                continue

            # try to load profile email from `profiles` table
            email = None
            try:
                pr = supabase_client.table("profiles").select("id, nome, email").eq("id", user_id).execute()
                profile = (pr.data or [None])[0]
                if profile and isinstance(profile, dict):
                    email = profile.get("email")
            except Exception:
                logger.exception("Falha ao carregar profile para user %s", user_id)

            # fallback: try to fetch user via auth admin (requires service role key)
            if not email:
                try:
                    admin_resp = supabase_client.auth.admin.get_user_by_id(user_id)
                    email = _extract_admin_user_email(admin_resp)
                except Exception:
                    logger.debug("Não foi possível obter email via admin API para %s", user_id)

            if not email or "@" not in str(email):
                logger.info("No email for farm owner %s (farm %s), skipping", user_id, farm.get("id"))
                continue

            subject = f"Alerta Visiagro: {payload.get('label', 'Praga detectada')} perto da sua lavoura"
            alert_map_bytes = None
            try:
                alert_map_bytes = _build_alert_map_image(farm, public_alert, payload)
            except Exception:
                logger.exception("Falha ao gerar imagem do mapa para alerta da lavoura %s", farm.get("id"))

            # Keep text generic to avoid exposing another user's exact detection location.
            confidence_text = _format_confidence(payload.get("confianca"))
            plain = (
                f"Detectamos {payload.get('label')} dentro da área de alerta da sua lavoura.\n"
                f"Confianca: {confidence_text}\n"
                "Abra o mapa no app para visualizar a área de alerta.\n"
            )

            map_html = ""
            map_cid = "alert_map"
            if alert_map_bytes:
                map_html = (
                    f'<div style="text-align:center;margin:12px 0;">'
                    f'<img src="cid:{map_cid}" alt="mapa do alerta" '
                    f'style="max-width:100%;height:auto;border-radius:12px;border:1px solid #d7f7a7"/>'
                    f'</div>'
                )

            img_html = ""
            cid = "detected_image"
            if image_bytes:
                img_html = (
                    f'<div style="text-align:center;margin:12px 0;">'
                    f'<img src="cid:{cid}" alt="detected" style="max-width:100%;height:auto;border-radius:12px;border:1px solid #e6e6e6"/>'
                    f'</div>'
                )

            html = f"""
            <div style="font-family:Inter,Arial,Helvetica,sans-serif;color:#111;line-height:1.4">
              <div style="background:#0a1a0a;color:white;padding:12px 14px;border-radius:6px;">
                <strong>Visiagro</strong> — Alerta de praga próxima
              </div>
              <div style="padding:12px;border:1px solid #f0f0f0;margin-top:8px;border-radius:6px;background:#fff">
                <p style="margin:0 0 6px 0"><strong>{payload.get('label')}</strong> foi detectada dentro da área de alerta da sua lavoura.</p>
                <p style="margin:0 0 6px 0">Confianca: <strong>{confidence_text}</strong></p>
                <p style="margin:0 0 6px 0">Risco: <strong>{payload.get('nivel_risco') or 'medio'}</strong></p>
                {map_html}
                {img_html}
                <p style="margin:6px 0 0 0;color:#555">A localização exata da detecção não é compartilhada. Abra o Visiagro para ver sua área de alerta.</p>
              </div>
            </div>
            """

            # try sending with retries
            attempt = 0
            while attempt < max_retries:
                try:
                    # build message and attach inline image if available
                    msg = _build_message(subject, email, plain, html)
                    if alert_map_bytes:
                        try:
                            payload_parts = msg.get_payload()
                            if isinstance(payload_parts, list) and len(payload_parts) > 1:
                                payload_parts[1].add_related(alert_map_bytes, maintype="image", subtype="png", cid=f"<{map_cid}>")
                            else:
                                msg.add_attachment(alert_map_bytes, maintype="image", subtype="png", filename="mapa-alerta-visiagro.png")
                        except Exception:
                            msg.add_attachment(alert_map_bytes, maintype="image", subtype="png", filename="mapa-alerta-visiagro.png")
                    if image_bytes:
                        try:
                            payload_parts = msg.get_payload()
                            if isinstance(payload_parts, list) and len(payload_parts) > 1:
                                html_part = payload_parts[1]
                                try:
                                    html_part.add_related(image_bytes, maintype="image", subtype="png", cid=f"<{cid}>")
                                except Exception:
                                    msg.add_attachment(image_bytes, maintype="image", subtype="png", filename=(payload.get("filename") or "detected.png"))
                            else:
                                msg.add_attachment(image_bytes, maintype="image", subtype="png", filename=(payload.get("filename") or "detected.png"))
                        except Exception:
                            msg.add_attachment(image_bytes, maintype="image", subtype="png", filename=(payload.get("filename") or "detected.png"))
                    send_smtp_email(msg=msg)
                    logger.info("Notified owner %s for farm %s", user_id, farm.get("id"))
                    try:
                        if public_alert.get("id"):
                            supabase_client.table("alertas_publicos").update(
                                {"notified_email_at": datetime.now(timezone.utc).isoformat()}
                            ).eq("id", public_alert["id"]).execute()
                        elif public_alert.get("prediction_id") and public_alert.get("target_farm_id"):
                            supabase_client.table("alertas_publicos").update(
                                {"notified_email_at": datetime.now(timezone.utc).isoformat()}
                            ).eq("prediction_id", public_alert["prediction_id"]).eq("target_farm_id", public_alert["target_farm_id"]).execute()
                    except Exception:
                        logger.debug("Nao foi possivel marcar notified_email_at para farm %s", farm.get("id"))
                    break
                except Exception:
                    attempt += 1
                    logger.exception("Erro ao enviar email para %s (tentativa %d)", email, attempt)
                    if attempt >= max_retries:
                        logger.error("Falha permanente ao notificar %s", email)
                    else:
                        time.sleep(2 ** attempt)

    except Exception:
        logger.exception("Erro geral em notify_nearby_farms")


def sync_historical_alerts_for_farm(
    supabase_client,
    farm: dict,
    max_predictions: int = 1000,
) -> dict:
    """Create missing public alerts for a newly created/edited farm using existing real predictions."""
    if supabase_client is None:
        raise RuntimeError("Supabase service client not configured.")
    if not farm or not farm.get("id") or not farm.get("user_id"):
        raise RuntimeError("Lavoura invalida para sincronizacao de alertas.")

    farm_lat = farm.get("latitude")
    farm_lng = farm.get("longitude")
    if farm_lat is None or farm_lng is None:
        return {"created": 0, "matched": 0, "checked": 0}

    radius_km = float(farm.get("raio_alerta_km") or farm.get("radius") or 5)
    target_user_id = farm.get("user_id")

    resp = (
        supabase_client.table("predictions")
        .select(
            """
            id,
            user_id,
            label,
            confianca,
            latitude,
            longitude,
            created_at,
            ativa,
            pestes (
              id,
              nome_comum,
              nivel_risco,
              acoes_recomendadas
            )
            """
        )
        .order("created_at", desc=True)
        .limit(max_predictions)
        .execute()
    )

    created = 0
    matched = 0
    checked = 0
    for prediction in resp.data or []:
        checked += 1
        try:
            source_user_id = prediction.get("user_id")
            if prediction.get("ativa") is False:
                continue
            if source_user_id == target_user_id:
                continue
            pest_lat = prediction.get("latitude")
            pest_lng = prediction.get("longitude")
            if pest_lat is None or pest_lng is None:
                continue

            dist = _haversine_km(float(pest_lat), float(pest_lng), float(farm_lat), float(farm_lng))
            if dist > radius_km:
                continue

            pest = prediction.get("pestes") if isinstance(prediction.get("pestes"), dict) else {}
            label = pest.get("nome_comum") or prediction.get("label") or "Praga detectada"
            region_lat, region_lng, area_radius_km = _approximate_alert_region(
                float(pest_lat),
                float(pest_lng),
                float(farm_lat),
                float(farm_lng),
                radius_km,
                dist,
            )
            public_alert = {
                "target_user_id": target_user_id,
                "target_farm_id": farm.get("id"),
                "source_user_id": source_user_id,
                "prediction_id": str(prediction.get("id")) if prediction.get("id") is not None else None,
                "label": label,
                "confianca": prediction.get("confianca"),
                "latitude": region_lat,
                "longitude": region_lng,
                "nivel_risco": pest.get("nivel_risco") or "medio",
                "recomendacao": pest.get("acoes_recomendadas") or "Abra o catálogo de pragas para ver recomendações cadastradas.",
                "distance_km": round(dist, 3),
                "area_radius_km": area_radius_km,
            }
            matched += 1
            if _save_public_alert_without_email(supabase_client, public_alert):
                created += 1
        except Exception:
            logger.exception("Erro ao sincronizar alerta historico para prediction %s", prediction.get("id"))

    return {"created": created, "matched": matched, "checked": checked}
