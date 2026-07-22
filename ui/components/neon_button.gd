class_name NeonButton
extends Button
## Accent neon button matching React Btn.

enum ButtonSize { SMALL, NORMAL, LARGE }

signal pressed_nav

@export var accent_color: Color = DesignTokens.NEON_PINK
@export var button_size: ButtonSize = ButtonSize.NORMAL
@export var full_width: bool = true
@export var icon_name: String = ""
@export var label_text: String = "BUTTON"

var _pressing: bool = false


func _ready() -> void:
	focus_mode = Control.FOCUS_ALL
	mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	_rebuild()
	button_down.connect(_on_down)
	button_up.connect(_on_up)
	pressed.connect(func() -> void: pressed_nav.emit())


func configure(text: String, color: Color, size: ButtonSize = ButtonSize.NORMAL, icon: String = "", full: bool = true) -> void:
	label_text = text
	accent_color = color
	button_size = size
	icon_name = icon
	full_width = full
	if is_inside_tree():
		_rebuild()


func _rebuild() -> void:
	text = ""
	for c in get_children():
		c.queue_free()
	var pad_v: int
	var pad_h: int
	var fs: int
	match button_size:
		ButtonSize.LARGE:
			pad_v = 14
			pad_h = 24
			fs = 17
		ButtonSize.SMALL:
			pad_v = 8
			pad_h = 14
			fs = 12
		_:
			pad_v = 11
			pad_h = 20
			fs = 14
	var normal := DesignTokens.make_panel_style(DesignTokens.with_alpha(accent_color, 0.72), accent_color, DesignTokens.RADIUS_BUTTON, 1)
	normal.shadow_color = DesignTokens.with_alpha(accent_color, 0.35)
	normal.shadow_size = 14
	normal.content_margin_left = pad_h
	normal.content_margin_right = pad_h
	normal.content_margin_top = pad_v
	normal.content_margin_bottom = pad_v
	var hover := normal.duplicate() as StyleBoxFlat
	hover.bg_color = DesignTokens.with_alpha(accent_color, 0.85)
	var pressed_sb := normal.duplicate() as StyleBoxFlat
	pressed_sb.shadow_size = 6
	pressed_sb.bg_color = DesignTokens.with_alpha(accent_color, 0.55)
	add_theme_stylebox_override("normal", normal)
	add_theme_stylebox_override("hover", hover)
	add_theme_stylebox_override("pressed", pressed_sb)
	add_theme_stylebox_override("focus", hover)
	add_theme_stylebox_override("disabled", DesignTokens.make_panel_style(DesignTokens.with_alpha(DesignTokens.MUTED, 0.25), DesignTokens.with_alpha(DesignTokens.MUTED, 0.35), DesignTokens.RADIUS_BUTTON, 1))

	var row := HBoxContainer.new()
	row.alignment = BoxContainer.ALIGNMENT_CENTER
	row.add_theme_constant_override("separation", 8)
	row.mouse_filter = Control.MOUSE_FILTER_IGNORE
	row.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(row)
	if icon_name != "":
		row.add_child(IconService.make_texture_rect(icon_name, fs + 2, DesignTokens.WHITE))
	var lab := Label.new()
	lab.text = label_text.to_upper()
	Fonts.apply(lab, Fonts.orbitron("Bold"), fs, DesignTokens.WHITE, 1.5)
	lab.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	lab.mouse_filter = Control.MOUSE_FILTER_IGNORE
	row.add_child(lab)
	if full_width:
		size_flags_horizontal = Control.SIZE_EXPAND_FILL
		custom_minimum_size = Vector2(0, pad_v * 2 + fs + 8)
	else:
		size_flags_horizontal = Control.SIZE_SHRINK_CENTER


func _on_down() -> void:
	_pressing = true
	var tw := create_tween()
	tw.tween_property(self, "scale", Vector2(0.95, 0.95), 0.12).set_trans(Tween.TRANS_SINE)


func _on_up() -> void:
	_pressing = false
	var tw := create_tween()
	tw.tween_property(self, "scale", Vector2.ONE, 0.12).set_trans(Tween.TRANS_SINE)
