class_name DesignTokens
extends RefCounted
## Central design tokens from res://design_reference/App.tsx

const REF_WIDTH := 390.0
const REF_HEIGHT := 844.0

const BG := Color("#050617")
const BG_SECONDARY := Color("#0A0D24")
const CARD := Color("#10132E")
const NEON_PINK := Color("#FF2DBB")
const MAGENTA := Color("#FF0F8F")
const ELECTRIC_BLUE := Color("#16C8FF")
const CYAN := Color("#4DEBFF")
const PURPLE := Color("#8D3DFF")
const ORANGE := Color("#FF9D1C")
const YELLOW := Color("#FFD339")
const GREEN := Color("#57F287")
const WHITE := Color("#F7F8FF")
const MUTED := Color("#9298BA")
const RED := Color("#FF365E")

const BLUE_BORDER_FAINT := Color(0.086, 0.784, 1.0, 0.13)
const BLUE_BORDER_MEDIUM := Color(0.086, 0.784, 1.0, 0.34)
const BLUE_BORDER_SOFT := Color(0.086, 0.784, 1.0, 0.09)
const PINK_GLOW_MEDIUM := Color(1.0, 0.176, 0.733, 0.47)
const PURPLE_GLOW_FAINT := Color(0.553, 0.239, 1.0, 0.13)
const BLUE_GLOW_FAINT := Color(0.086, 0.784, 1.0, 0.18)
const PINK_BORDER_SOFT := Color(1.0, 0.176, 0.733, 0.27)

const PAD_SCREEN := 16.0
const PAD_LANE_SIDE := 10.0
const GAP_LANE := 7.0
const GAP_MENU_BTN := 12.0
const RADIUS_SMALL := 6.0
const RADIUS_TAB := 8.0
const RADIUS_BUTTON := 10.0
const RADIUS_COMPACT := 12.0
const RADIUS_CARD := 14.0
const RADIUS_TILE := 18.0
const RADIUS_MODAL := 20.0
const TOUCH_MIN := 44.0

const FADE_MS := 0.12
const SCREEN_FADE_MS := 0.11

static func with_alpha(color: Color, alpha: float) -> Color:
	return Color(color.r, color.g, color.b, alpha)


static func make_card_style(accent: Color, radius: float = RADIUS_CARD) -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color = CARD
	sb.set_corner_radius_all(int(radius))
	sb.border_width_left = 1
	sb.border_width_top = 1
	sb.border_width_right = 1
	sb.border_width_bottom = 1
	sb.border_color = with_alpha(accent, 0.27)
	sb.shadow_color = with_alpha(accent, 0.09)
	sb.shadow_size = 8
	sb.content_margin_left = 0
	sb.content_margin_top = 0
	sb.content_margin_right = 0
	sb.content_margin_bottom = 0
	return sb


static func make_panel_style(bg: Color, border: Color, radius: float, border_w: int = 1) -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color = bg
	sb.set_corner_radius_all(int(radius))
	sb.border_width_left = border_w
	sb.border_width_top = border_w
	sb.border_width_right = border_w
	sb.border_width_bottom = border_w
	sb.border_color = border
	return sb
