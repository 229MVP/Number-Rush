class_name CurrencyChip
extends PanelContainer
## Coins + gems chip matching React CurrChip.


func _ready() -> void:
	var sb := DesignTokens.make_panel_style(DesignTokens.CARD, DesignTokens.with_alpha(DesignTokens.ELECTRIC_BLUE, 0.13), 20.0, 1)
	sb.content_margin_left = 10
	sb.content_margin_right = 10
	sb.content_margin_top = 5
	sb.content_margin_bottom = 5
	add_theme_stylebox_override("panel", sb)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 6)
	add_child(row)
	_add_token(row, "⬡", DesignTokens.YELLOW, str(SaveService.coins))
	_add_token(row, "◆", DesignTokens.NEON_PINK, str(SaveService.gems))
	SaveService.changed.connect(_refresh)


func _add_token(row: HBoxContainer, icon: String, color: Color, value: String) -> void:
	var ic := Label.new()
	ic.name = "Icon_%s" % icon
	ic.text = icon
	Fonts.apply(ic, Fonts.rajdhani("Bold"), 12, color)
	row.add_child(ic)
	var val := Label.new()
	val.name = "Val_%s" % icon
	val.text = _fmt(int(value)) if value.is_valid_int() else value
	Fonts.apply(val, Fonts.rajdhani("Bold"), 12, DesignTokens.WHITE)
	row.add_child(val)


func _refresh() -> void:
	_set_val("⬡", SaveService.coins)
	_set_val("◆", SaveService.gems)


func _set_val(icon: String, amount: int) -> void:
	var row := get_child(0) as HBoxContainer
	if row == null:
		return
	var node := row.get_node_or_null("Val_%s" % icon) as Label
	if node:
		node.text = _fmt(amount)


func _fmt(n: int) -> String:
	var s := str(n)
	var out := ""
	var count := 0
	for i in range(s.length() - 1, -1, -1):
		if count > 0 and count % 3 == 0:
			out = "," + out
		out = s[i] + out
		count += 1
	return out
