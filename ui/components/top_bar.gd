class_name TopBar
extends PanelContainer
## Top navigation bar with optional back + right slot.

signal back_pressed

@export var title_text: String = "TITLE"
@export var show_back: bool = true

var _title: Label
var _right_slot: HBoxContainer


func _ready() -> void:
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0, 0, 0, 0)
	sb.border_width_bottom = 1
	sb.border_color = DesignTokens.BLUE_BORDER_SOFT
	sb.content_margin_left = 16
	sb.content_margin_right = 16
	sb.content_margin_top = 14
	sb.content_margin_bottom = 14
	add_theme_stylebox_override("panel", sb)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 8)
	add_child(row)
	if show_back:
		var back := NeonIconButton.new()
		back.configure("arrow-left", DesignTokens.ELECTRIC_BLUE)
		back.pressed_nav.connect(func() -> void: back_pressed.emit())
		row.add_child(back)
	else:
		var spacer := Control.new()
		spacer.custom_minimum_size = Vector2(36, 36)
		row.add_child(spacer)
	_title = Label.new()
	_title.text = title_text.to_upper()
	Fonts.apply(_title, Fonts.orbitron("Bold"), 14, DesignTokens.WHITE, 2.0)
	_title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	row.add_child(_title)
	_right_slot = HBoxContainer.new()
	_right_slot.alignment = BoxContainer.ALIGNMENT_END
	_right_slot.custom_minimum_size = Vector2(36, 36)
	row.add_child(_right_slot)


func set_title(t: String) -> void:
	title_text = t
	if _title:
		_title.text = t.to_upper()


func set_right(node: Control) -> void:
	if _right_slot == null:
		return
	for c in _right_slot.get_children():
		c.queue_free()
	_right_slot.add_child(node)
