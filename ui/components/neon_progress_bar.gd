class_name NeonProgressBar
extends ProgressBar
## 5px neon progress track matching React ProgBar.

@export var fill_color: Color = DesignTokens.NEON_PINK


func _ready() -> void:
	custom_minimum_size = Vector2(0, 5)
	max_value = 100.0
	show_percentage = false
	_apply_styles()


func set_fill(color: Color) -> void:
	fill_color = color
	_apply_styles()


func set_pct(pct: float) -> void:
	value = clampf(pct, 0.0, 100.0)


func _apply_styles() -> void:
	var bg := StyleBoxFlat.new()
	bg.bg_color = DesignTokens.BG_SECONDARY
	bg.set_corner_radius_all(4)
	var fill := StyleBoxFlat.new()
	fill.bg_color = fill_color
	fill.set_corner_radius_all(4)
	fill.shadow_color = DesignTokens.with_alpha(fill_color, 0.55)
	fill.shadow_size = 4
	add_theme_stylebox_override("background", bg)
	add_theme_stylebox_override("fill", fill)
