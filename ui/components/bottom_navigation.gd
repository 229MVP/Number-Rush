class_name BottomNavigation
extends PanelContainer
## Four-tab bottom nav matching React BottomNav.

signal navigate(screen_id: String)

@export var active_id: String = "menu"

var _items: Array[Dictionary] = [
	{"id": "menu", "icon": "home", "label": "HOME"},
	{"id": "missions", "icon": "target", "label": "MISSIONS"},
	{"id": "leaderboard", "icon": "trophy", "label": "RANKS"},
	{"id": "profile", "icon": "user", "label": "PROFILE"},
]

var _buttons: Array[Button] = []
var _indicators: Array[ColorRect] = []
var _icons: Array[TextureRect] = []
var _labels: Array[Label] = []


func _ready() -> void:
	var sb := StyleBoxFlat.new()
	sb.bg_color = DesignTokens.with_alpha(DesignTokens.BG_SECONDARY, 0.93)
	sb.border_width_top = 1
	sb.border_color = DesignTokens.BLUE_BORDER_SOFT
	sb.content_margin_top = 6
	sb.content_margin_bottom = 2
	add_theme_stylebox_override("panel", sb)
	var row := HBoxContainer.new()
	row.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	add_child(row)
	for item in _items:
		var btn := Button.new()
		btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		btn.flat = true
		btn.focus_mode = Control.FOCUS_NONE
		btn.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
		var empty := StyleBoxEmpty.new()
		btn.add_theme_stylebox_override("normal", empty)
		btn.add_theme_stylebox_override("hover", empty)
		btn.add_theme_stylebox_override("pressed", empty)
		btn.add_theme_stylebox_override("focus", empty)
		var col := VBoxContainer.new()
		col.alignment = BoxContainer.ALIGNMENT_CENTER
		col.add_theme_constant_override("separation", 3)
		col.mouse_filter = Control.MOUSE_FILTER_IGNORE
		col.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		btn.add_child(col)
		var icon := IconService.make_texture_rect(str(item["icon"]), 20, DesignTokens.MUTED)
		col.add_child(icon)
		var lab := Label.new()
		lab.text = str(item["label"])
		Fonts.apply(lab, Fonts.rajdhani("Bold"), 9, DesignTokens.MUTED, 0.5)
		lab.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		lab.mouse_filter = Control.MOUSE_FILTER_IGNORE
		col.add_child(lab)
		var ind := ColorRect.new()
		ind.custom_minimum_size = Vector2(18, 2)
		ind.color = DesignTokens.NEON_PINK
		ind.visible = false
		ind.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var ind_wrap := CenterContainer.new()
		ind_wrap.mouse_filter = Control.MOUSE_FILTER_IGNORE
		ind_wrap.add_child(ind)
		col.add_child(ind_wrap)
		var id := str(item["id"])
		btn.pressed.connect(func() -> void: navigate.emit(id))
		row.add_child(btn)
		_buttons.append(btn)
		_indicators.append(ind)
		_icons.append(icon)
		_labels.append(lab)
	set_active(active_id)


func set_active(id: String) -> void:
	active_id = id
	if _icons.is_empty():
		return
	for i in _items.size():
		var on: bool = str(_items[i]["id"]) == id
		_icons[i].modulate = DesignTokens.NEON_PINK if on else DesignTokens.MUTED
		Fonts.apply(_labels[i], Fonts.rajdhani("Bold"), 9, DesignTokens.NEON_PINK if on else DesignTokens.MUTED, 0.5)
		_indicators[i].visible = on
