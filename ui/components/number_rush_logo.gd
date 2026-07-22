class_name NumberRushLogo
extends Control
## NUMBER / RUSH stacked logo with glow + slight skew via rotation approximation.

@export var logo_scale: float = 1.0

var _number: Label
var _rush: Label
var _number_glow: Label
var _rush_glow: Label


func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	custom_minimum_size = Vector2(260, 90) * logo_scale
	_build()


func _build() -> void:
	for c in get_children():
		c.queue_free()
	var box := VBoxContainer.new()
	box.alignment = BoxContainer.ALIGNMENT_CENTER
	box.add_theme_constant_override("separation", int(-6 * logo_scale))
	box.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(box)

	var n_wrap := Control.new()
	n_wrap.custom_minimum_size = Vector2(0, 42 * logo_scale)
	box.add_child(n_wrap)
	_number_glow = _make_line("NUMBER", Fonts.orbitron("Black"), int(38 * logo_scale), DesignTokens.with_alpha(DesignTokens.NEON_PINK, 0.45))
	_number_glow.position = Vector2(1, 2)
	n_wrap.add_child(_number_glow)
	_number = _make_line("NUMBER", Fonts.orbitron("Black"), int(38 * logo_scale), DesignTokens.NEON_PINK)
	n_wrap.add_child(_number)

	var r_wrap := Control.new()
	r_wrap.custom_minimum_size = Vector2(0, 50 * logo_scale)
	box.add_child(r_wrap)
	_rush_glow = _make_line("RUSH", Fonts.orbitron("Black"), int(46 * logo_scale), DesignTokens.with_alpha(DesignTokens.ELECTRIC_BLUE, 0.45))
	_rush_glow.position = Vector2(1, 2)
	r_wrap.add_child(_rush_glow)
	_rush = _make_line("RUSH", Fonts.orbitron("Black"), int(46 * logo_scale), DesignTokens.ELECTRIC_BLUE)
	r_wrap.add_child(_rush)

	# Approximate skewX(-4deg) with slight rotation
	rotation_degrees = -1.5


func _make_line(text: String, font: Font, size: int, color: Color) -> Label:
	var l := Label.new()
	l.text = text
	Fonts.apply(l, font, size, color, 4.0 if text == "NUMBER" else 6.0)
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	l.set_anchors_preset(Control.PRESET_FULL_RECT)
	l.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return l


func set_logo_scale(s: float) -> void:
	logo_scale = s
	custom_minimum_size = Vector2(260, 90) * logo_scale
	_build()
