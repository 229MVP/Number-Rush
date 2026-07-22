extends ScreenBase
## Settings with audio / preferences / account.


func on_enter(_payload: Dictionary = {}) -> void:
	screen_id = "settings"
	_build()


func _build() -> void:
	for c in get_children():
		c.queue_free()
	var root := VBoxContainer.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(root)
	var top := TopBar.new()
	top.title_text = "SETTINGS"
	top.back_pressed.connect(func() -> void: nav("menu"))
	root.add_child(top)
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
	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 14)
	col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	pad.add_child(col)
	col.add_child(_section("AUDIO", [
		{"icon": "music", "label": "Music", "toggle": true, "key": "music"},
		{"icon": "volume-2", "label": "Sound Effects", "toggle": true, "key": "sfx"},
		{"icon": "vibrate", "label": "Haptics", "toggle": true, "key": "haptics"},
	]))
	col.add_child(_section("PREFERENCES", [
		{"icon": "bell", "label": "Notifications", "toggle": true, "key": "notifs"},
		{"icon": "globe", "label": "Language", "toggle": false, "right": "English"},
	]))
	col.add_child(_section("ACCOUNT", [
		{"icon": "shield", "label": "Privacy", "toggle": false},
		{"icon": "help-circle", "label": "Support", "toggle": false},
		{"icon": "restart", "label": "Restore Purchases", "toggle": false},
		{"icon": "log-out", "label": "Sign Out", "toggle": false, "danger": true},
	]))


func _section(title: String, items: Array) -> VBoxContainer:
	var wrap := VBoxContainer.new()
	wrap.add_theme_constant_override("separation", 8)
	var cap := Label.new()
	cap.text = title
	Fonts.apply(cap, Fonts.rajdhani("Bold"), 10, DesignTokens.MUTED, 2.0)
	wrap.add_child(cap)
	var card := PanelContainer.new()
	card.add_theme_stylebox_override("panel", DesignTokens.make_card_style(DesignTokens.ELECTRIC_BLUE))
	var col := VBoxContainer.new()
	card.add_child(col)
	for i in items.size():
		var item: Dictionary = items[i]
		col.add_child(_row(item, i < items.size() - 1))
	wrap.add_child(card)
	return wrap


func _row(item: Dictionary, divider: bool) -> Control:
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 12)
	var m := MarginContainer.new()
	m.add_theme_constant_override("margin_left", 14)
	m.add_theme_constant_override("margin_right", 14)
	m.add_theme_constant_override("margin_top", 13)
	m.add_theme_constant_override("margin_bottom", 13)
	m.add_child(row)
	var danger := bool(item.get("danger", false))
	var icon_col := DesignTokens.RED if danger else DesignTokens.MUTED
	row.add_child(IconService.make_texture_rect(str(item["icon"]), 16, icon_col))
	var lab := Label.new()
	lab.text = str(item["label"])
	lab.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	Fonts.apply(lab, Fonts.rajdhani("SemiBold"), 14, DesignTokens.RED if danger else DesignTokens.WHITE)
	row.add_child(lab)
	if bool(item.get("toggle", false)):
		var sw := ToggleSwitch.new()
		var key := str(item.get("key", ""))
		var initial := false
		match key:
			"music":
				initial = SaveService.music_enabled
				sw.toggled.connect(func(v: bool) -> void:
					SaveService.music_enabled = v
					SaveService.save()
				)
			"sfx":
				initial = SaveService.sfx_enabled
				sw.toggled.connect(func(v: bool) -> void:
					SaveService.sfx_enabled = v
					SaveService.save()
				)
			"haptics":
				initial = SaveService.haptics_enabled
				sw.toggled.connect(func(v: bool) -> void:
					SaveService.haptics_enabled = v
					SaveService.save()
				)
			"notifs":
				initial = SaveService.notifications_enabled
				sw.toggled.connect(func(v: bool) -> void:
					SaveService.notifications_enabled = v
					SaveService.save()
				)
		sw.is_on = initial
		row.add_child(sw)
	elif item.has("right"):
		var r := Label.new()
		r.text = str(item["right"])
		Fonts.apply(r, Fonts.rajdhani("Bold"), 12, DesignTokens.MUTED)
		row.add_child(r)
	else:
		row.add_child(IconService.make_texture_rect("chevron-right", 14, DesignTokens.MUTED))
	if divider:
		var wrap := VBoxContainer.new()
		wrap.add_child(m)
		var line := ColorRect.new()
		line.custom_minimum_size = Vector2(0, 1)
		line.color = DesignTokens.with_alpha(DesignTokens.ELECTRIC_BLUE, 0.07)
		wrap.add_child(line)
		return wrap
	return m
