class_name NeonIconButton
extends Button
## 36×36 icon button matching React IconBtn.

signal pressed_nav

@export var accent_color: Color = DesignTokens.ELECTRIC_BLUE
@export var icon_name: String = "settings"
@export var circular: bool = false
@export var button_diameter: float = 36.0


func _ready() -> void:
	focus_mode = Control.FOCUS_ALL
	mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	custom_minimum_size = Vector2(button_diameter, button_diameter)
	_rebuild()
	pressed.connect(func() -> void: pressed_nav.emit())


func configure(icon: String, color: Color = DesignTokens.ELECTRIC_BLUE, diameter: float = 36.0, is_circular: bool = false) -> void:
	icon_name = icon
	accent_color = color
	button_diameter = diameter
	circular = is_circular
	custom_minimum_size = Vector2(diameter, diameter)
	if is_inside_tree():
		_rebuild()


func _rebuild() -> void:
	text = ""
	for c in get_children():
		c.queue_free()
	var radius := button_diameter * 0.5 if circular else DesignTokens.RADIUS_BUTTON
	var border_w := 2 if circular else 1
	var sb := DesignTokens.make_panel_style(DesignTokens.CARD, DesignTokens.with_alpha(accent_color, 0.53 if circular else 0.27), radius, border_w)
	if circular:
		sb.shadow_color = DesignTokens.with_alpha(accent_color, 0.27)
		sb.shadow_size = 8
	add_theme_stylebox_override("normal", sb)
	add_theme_stylebox_override("hover", sb)
	add_theme_stylebox_override("pressed", sb)
	add_theme_stylebox_override("focus", sb)
	var icon_sz := 18 if circular else 17
	var tr := IconService.make_texture_rect(icon_name, icon_sz, accent_color)
	tr.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	tr.position = Vector2((button_diameter - icon_sz) * 0.5, (button_diameter - icon_sz) * 0.5)
	add_child(tr)
