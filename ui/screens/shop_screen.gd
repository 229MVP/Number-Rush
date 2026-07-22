extends ScreenBase
## Shop with power-ups / themes / coins / gems tabs.

var _tab: int = 0
var _content: VBoxContainer


func on_enter(_payload: Dictionary = {}) -> void:
	screen_id = "shop"
	_build()


func _build() -> void:
	for c in get_children():
		c.queue_free()
	var root := VBoxContainer.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(root)
	var top := TopBar.new()
	top.title_text = "SHOP"
	top.back_pressed.connect(func() -> void: nav("menu"))
	root.add_child(top)
	top.set_right(CurrencyChip.new())
	var tabs_m := MarginContainer.new()
	tabs_m.add_theme_constant_override("margin_left", 16)
	tabs_m.add_theme_constant_override("margin_right", 16)
	tabs_m.add_theme_constant_override("margin_top", 10)
	root.add_child(tabs_m)
	var tabs := HBoxContainer.new()
	tabs.add_theme_constant_override("separation", 6)
	tabs_m.add_child(tabs)
	var names := ["POWER-UPS", "THEMES", "COINS", "GEMS"]
	for i in names.size():
		var b := Button.new()
		b.text = names[i]
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		b.add_theme_font_override("font", Fonts.rajdhani("Bold"))
		b.add_theme_font_size_override("font_size", 9)
		var on := i == _tab
		var sb := DesignTokens.make_panel_style(DesignTokens.with_alpha(DesignTokens.NEON_PINK, 0.13) if on else DesignTokens.CARD, DesignTokens.NEON_PINK if on else DesignTokens.with_alpha(DesignTokens.ELECTRIC_BLUE, 0.13), DesignTokens.RADIUS_TAB, 1)
		sb.content_margin_top = 7
		sb.content_margin_bottom = 7
		b.add_theme_stylebox_override("normal", sb)
		b.add_theme_stylebox_override("hover", sb)
		b.add_theme_stylebox_override("pressed", sb)
		b.add_theme_color_override("font_color", DesignTokens.NEON_PINK if on else DesignTokens.MUTED)
		var idx := i
		b.pressed.connect(func() -> void:
			_tab = idx
			_rebuild_content()
			_build()
		)
		tabs.add_child(b)
	var body := Control.new()
	body.size_flags_vertical = Control.SIZE_EXPAND_FILL
	root.add_child(body)
	var bg := ColorRect.new()
	bg.color = DesignTokens.BG
	bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	body.add_child(bg)
	var grid := GridBackground.new()
	grid.opacity = 0.04
	body.add_child(grid)
	var scroll := ScrollContainer.new()
	scroll.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	body.add_child(scroll)
	var pad := MarginContainer.new()
	pad.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	pad.add_theme_constant_override("margin_left", 16)
	pad.add_theme_constant_override("margin_right", 16)
	pad.add_theme_constant_override("margin_top", 12)
	pad.add_theme_constant_override("margin_bottom", 12)
	scroll.add_child(pad)
	_content = VBoxContainer.new()
	_content.add_theme_constant_override("separation", 10)
	_content.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	pad.add_child(_content)
	_rebuild_content()
	var nav_bar := BottomNavigation.new()
	nav_bar.set_active("menu")
	nav_bar.navigate.connect(func(id: String) -> void: nav(id))
	root.add_child(nav_bar)


func _rebuild_content() -> void:
	for c in _content.get_children():
		c.queue_free()
	match _tab:
		0:
			_add_pu("MULTIPLIER x5", 500, DesignTokens.ORANGE, "multiplier", 5)
			_add_pu("BOMB TILE x3", 800, DesignTokens.RED, "bomb", 3)
			_add_pu("FREEZE x5", 300, DesignTokens.CYAN, "freeze", 5)
			_add_pu("SHIELD x3", 1200, DesignTokens.ELECTRIC_BLUE, "shield", 3)
		1:
			_add_theme("CYBER VOID", 2500, DesignTokens.PURPLE)
			_add_theme("SOLAR FLARE", 3000, DesignTokens.ORANGE)
			_add_theme("OCEAN PULSE", 2800, DesignTokens.CYAN)
		2:
			_add_currency("5,000 COINS", 5000, 0, DesignTokens.YELLOW, false)
			_add_currency("15,000 COINS", 15000, 0, DesignTokens.YELLOW, false)
			_add_currency("50,000 COINS", 50000, 0, DesignTokens.YELLOW, false)
		3:
			_add_currency("100 GEMS", 0, 100, DesignTokens.NEON_PINK, true)
			_add_currency("500 GEMS", 0, 500, DesignTokens.NEON_PINK, true)
			_add_currency("2,000 GEMS", 0, 2000, DesignTokens.NEON_PINK, true)


func _add_pu(name: String, price: int, color: Color, key: String, qty: int) -> void:
	var p := PanelContainer.new()
	p.add_theme_stylebox_override("panel", DesignTokens.make_card_style(color))
	var m := MarginContainer.new()
	m.add_theme_constant_override("margin_left", 14)
	m.add_theme_constant_override("margin_right", 14)
	m.add_theme_constant_override("margin_top", 14)
	m.add_theme_constant_override("margin_bottom", 14)
	p.add_child(m)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 12)
	m.add_child(row)
	var name_l := Label.new()
	name_l.text = name
	name_l.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	Fonts.apply(name_l, Fonts.orbitron("Bold"), 11, color, 0.5)
	row.add_child(name_l)
	var buy := NeonButton.new()
	buy.configure("⬡ %d" % price, color, NeonButton.ButtonSize.SMALL, "", false)
	buy.pressed_nav.connect(func() -> void:
		if SaveService.coins >= price:
			SaveService.add_coins(-price)
			SaveService.grant_item(key, qty)
	)
	row.add_child(buy)
	_content.add_child(p)


func _add_theme(name: String, price: int, color: Color) -> void:
	var p := PanelContainer.new()
	p.add_theme_stylebox_override("panel", DesignTokens.make_card_style(color))
	var m := MarginContainer.new()
	m.add_theme_constant_override("margin_left", 14)
	m.add_theme_constant_override("margin_right", 14)
	m.add_theme_constant_override("margin_top", 14)
	m.add_theme_constant_override("margin_bottom", 14)
	p.add_child(m)
	var v := VBoxContainer.new()
	v.add_theme_constant_override("separation", 10)
	m.add_child(v)
	var preview := ColorRect.new()
	preview.custom_minimum_size = Vector2(0, 56)
	preview.color = DesignTokens.with_alpha(color, 0.35)
	v.add_child(preview)
	var row := HBoxContainer.new()
	v.add_child(row)
	var name_l := Label.new()
	name_l.text = name
	name_l.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	Fonts.apply(name_l, Fonts.orbitron("Bold"), 12, color)
	row.add_child(name_l)
	var buy := NeonButton.new()
	buy.configure("⬡ %d" % price, color, NeonButton.ButtonSize.SMALL, "", false)
	buy.pressed_nav.connect(func() -> void:
		if SaveService.coins >= price:
			SaveService.add_coins(-price)
	)
	row.add_child(buy)
	_content.add_child(p)


func _add_currency(label: String, coins: int, gems: int, color: Color, is_gem: bool) -> void:
	var p := PanelContainer.new()
	p.add_theme_stylebox_override("panel", DesignTokens.make_card_style(color))
	var m := MarginContainer.new()
	m.add_theme_constant_override("margin_left", 14)
	m.add_theme_constant_override("margin_right", 14)
	m.add_theme_constant_override("margin_top", 14)
	m.add_theme_constant_override("margin_bottom", 14)
	p.add_child(m)
	var row := HBoxContainer.new()
	m.add_child(row)
	var name_l := Label.new()
	name_l.text = ("◆ " if is_gem else "⬡ ") + label
	name_l.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	Fonts.apply(name_l, Fonts.orbitron("ExtraBold"), 16, color)
	row.add_child(name_l)
	var buy := NeonButton.new()
	buy.configure("GET", color, NeonButton.ButtonSize.SMALL, "", false)
	buy.pressed_nav.connect(func() -> void:
		# Local prototype grant — no real-money IAP yet.
		if coins > 0:
			SaveService.add_coins(coins)
		if gems > 0:
			SaveService.add_gems(gems)
	)
	row.add_child(buy)
	_content.add_child(p)
