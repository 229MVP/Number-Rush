class_name TargetPanel
extends PanelContainer
## TARGET N badge above lanes.

var _value: Label


func _ready() -> void:
	var sb := DesignTokens.make_panel_style(DesignTokens.CARD, DesignTokens.with_alpha(DesignTokens.ELECTRIC_BLUE, 0.53), DesignTokens.RADIUS_COMPACT, 2)
	sb.shadow_color = DesignTokens.with_alpha(DesignTokens.ELECTRIC_BLUE, 0.27)
	sb.shadow_size = 10
	sb.content_margin_left = 24
	sb.content_margin_right = 24
	sb.content_margin_top = 5
	sb.content_margin_bottom = 5
	add_theme_stylebox_override("panel", sb)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 10)
	row.alignment = BoxContainer.ALIGNMENT_CENTER
	add_child(row)
	var cap := Label.new()
	cap.text = "TARGET"
	Fonts.apply(cap, Fonts.rajdhani("Bold"), 11, DesignTokens.MUTED, 2.0)
	row.add_child(cap)
	_value = Label.new()
	_value.text = "21"
	Fonts.apply(_value, Fonts.orbitron("Black"), 26, DesignTokens.ELECTRIC_BLUE)
	row.add_child(_value)


func set_target(n: int) -> void:
	if _value:
		_value.text = str(n)
