class_name SecondaryButton
extends Button
## Dark secondary button matching React SecBtn.

signal pressed_nav

@export var label_text: String = "BUTTON"
@export var icon_name: String = ""


func _ready() -> void:
	focus_mode = Control.FOCUS_ALL
	mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	_rebuild()
	pressed.connect(func() -> void: pressed_nav.emit())


func configure(text: String, icon: String = "") -> void:
	label_text = text
	icon_name = icon
	if is_inside_tree():
		_rebuild()


func _rebuild() -> void:
	text = ""
	for c in get_children():
		c.queue_free()
	var sb := DesignTokens.make_panel_style(DesignTokens.BG_SECONDARY, DesignTokens.BLUE_BORDER_MEDIUM, DesignTokens.RADIUS_BUTTON, 1)
	sb.shadow_color = DesignTokens.BLUE_GLOW_FAINT
	sb.shadow_size = 6
	sb.content_margin_left = 20
	sb.content_margin_right = 20
	sb.content_margin_top = 11
	sb.content_margin_bottom = 11
	add_theme_stylebox_override("normal", sb)
	add_theme_stylebox_override("hover", sb)
	add_theme_stylebox_override("pressed", sb)
	add_theme_stylebox_override("focus", sb)
	size_flags_horizontal = Control.SIZE_EXPAND_FILL
	var row := HBoxContainer.new()
	row.alignment = BoxContainer.ALIGNMENT_CENTER
	row.add_theme_constant_override("separation", 8)
	row.mouse_filter = Control.MOUSE_FILTER_IGNORE
	row.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(row)
	if icon_name != "":
		row.add_child(IconService.make_texture_rect(icon_name, 15, DesignTokens.MUTED))
	var lab := Label.new()
	lab.text = label_text.to_upper()
	Fonts.apply(lab, Fonts.orbitron("SemiBold"), 13, DesignTokens.MUTED, 1.0)
	lab.mouse_filter = Control.MOUSE_FILTER_IGNORE
	row.add_child(lab)
