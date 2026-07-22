class_name NumberTile
extends PanelContainer
## Current / next number tile visuals.

enum TileKind { CURRENT, NEXT }

@export var kind: TileKind = TileKind.CURRENT
@export var value: int = 1

var _label: Label


func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_STOP
	_build()
	set_value(value)


func _build() -> void:
	for c in get_children():
		c.queue_free()
	var is_current := kind == TileKind.CURRENT
	custom_minimum_size = Vector2(72, 72) if is_current else Vector2(46, 46)
	var radius := DesignTokens.RADIUS_TILE if is_current else DesignTokens.RADIUS_COMPACT
	var border := DesignTokens.PURPLE if is_current else DesignTokens.with_alpha(DesignTokens.ELECTRIC_BLUE, 0.33)
	var bg := DesignTokens.with_alpha(DesignTokens.PURPLE, 0.33) if is_current else DesignTokens.with_alpha(DesignTokens.ELECTRIC_BLUE, 0.16)
	var sb := DesignTokens.make_panel_style(bg, border, radius, 2 if is_current else 1)
	if is_current:
		sb.shadow_color = DesignTokens.with_alpha(DesignTokens.PURPLE, 0.55)
		sb.shadow_size = 18
	else:
		sb.shadow_color = DesignTokens.with_alpha(DesignTokens.ELECTRIC_BLUE, 0.2)
		sb.shadow_size = 8
		modulate.a = 0.75
	add_theme_stylebox_override("panel", sb)
	_label = Label.new()
	_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	_label.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	Fonts.apply(_label, Fonts.orbitron("Black" if is_current else "ExtraBold"), 38 if is_current else 22, DesignTokens.WHITE if is_current else DesignTokens.ELECTRIC_BLUE)
	add_child(_label)
	if is_current:
		_add_corner(true)
		_add_corner(false)


func _add_corner(top_left: bool) -> void:
	var c := ColorRect.new()
	c.color = Color(0, 0, 0, 0)
	c.custom_minimum_size = Vector2(12, 12)
	c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0, 0, 0, 0)
	sb.border_color = DesignTokens.NEON_PINK
	if top_left:
		sb.border_width_top = 2
		sb.border_width_left = 2
		c.set_anchors_preset(Control.PRESET_TOP_LEFT)
		c.offset_left = 0
		c.offset_top = 0
		c.offset_right = 12
		c.offset_bottom = 12
	else:
		sb.border_width_bottom = 2
		sb.border_width_right = 2
		c.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
		c.offset_left = -12
		c.offset_top = -12
		c.offset_right = 0
		c.offset_bottom = 0
	# Use Panel for border corners
	var p := Panel.new()
	p.mouse_filter = Control.MOUSE_FILTER_IGNORE
	p.add_theme_stylebox_override("panel", sb)
	p.set_anchors_preset(Control.PRESET_TOP_LEFT if top_left else Control.PRESET_BOTTOM_RIGHT)
	if top_left:
		p.offset_right = 12
		p.offset_bottom = 12
	else:
		p.anchor_left = 1.0
		p.anchor_top = 1.0
		p.anchor_right = 1.0
		p.anchor_bottom = 1.0
		p.offset_left = -12
		p.offset_top = -12
		p.offset_right = 0
		p.offset_bottom = 0
	add_child(p)


func set_value(v: int) -> void:
	value = v
	if _label:
		_label.text = str(v)


func animate_spawn() -> void:
	modulate.a = 0.0
	scale = Vector2(0.8, 0.8)
	var tw := create_tween()
	tw.tween_property(self, "modulate:a", 1.0 if kind == TileKind.CURRENT else 0.75, 0.2)
	tw.parallel().tween_property(self, "scale", Vector2.ONE, 0.22).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
