extends ScreenBase
## Splash screen — tap / Enter / Space → menu.


func on_enter(_payload: Dictionary = {}) -> void:
	screen_id = "splash"
	_build()


func _build() -> void:
	for c in get_children():
		c.queue_free()
	var root := Control.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(root)
	var bg := ColorRect.new()
	bg.color = DesignTokens.BG
	bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.add_child(bg)
	# Radial purple glow approximation
	var glow := ColorRect.new()
	glow.color = DesignTokens.with_alpha(DesignTokens.PURPLE, 0.16)
	glow.set_anchors_preset(Control.PRESET_CENTER_TOP)
	glow.anchor_left = 0.15
	glow.anchor_right = 0.85
	glow.anchor_top = 0.15
	glow.anchor_bottom = 0.55
	glow.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(glow)
	var grid := GridBackground.new()
	grid.opacity = 0.05
	root.add_child(grid)
	var pgrid := PerspectiveGrid.new()
	pgrid.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	pgrid.anchor_top = 1.0
	pgrid.offset_top = -180
	pgrid.offset_bottom = 0
	root.add_child(pgrid)
	_add_dots(root)
	_add_sparks(root)
	var center := VBoxContainer.new()
	center.alignment = BoxContainer.ALIGNMENT_CENTER
	center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	center.add_theme_constant_override("separation", 14)
	root.add_child(center)
	var top_spacer := Control.new()
	top_spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
	center.add_child(top_spacer)
	var zap := IconService.make_texture_rect("zap", 30, DesignTokens.YELLOW)
	var zap_wrap := CenterContainer.new()
	zap_wrap.add_child(zap)
	center.add_child(zap_wrap)
	var logo := NumberRushLogo.new()
	logo.logo_scale = 1.0
	var logo_wrap := CenterContainer.new()
	logo_wrap.add_child(logo)
	center.add_child(logo_wrap)
	var sub := Label.new()
	sub.text = "PLACE. STACK. HIT THE TARGET."
	Fonts.apply(sub, Fonts.rajdhani("SemiBold"), 14, DesignTokens.MUTED, 3.0)
	sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	center.add_child(sub)
	var bottom_spacer := Control.new()
	bottom_spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
	center.add_child(bottom_spacer)
	# Holographic platform
	var platform := ColorRect.new()
	platform.color = DesignTokens.with_alpha(DesignTokens.NEON_PINK, 0.35)
	platform.custom_minimum_size = Vector2(200, 8)
	platform.set_anchors_preset(Control.PRESET_CENTER_BOTTOM)
	platform.anchor_left = 0.5
	platform.anchor_right = 0.5
	platform.offset_left = -100
	platform.offset_right = 100
	platform.offset_top = -136
	platform.offset_bottom = -128
	platform.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(platform)
	var tap := Label.new()
	tap.name = "TapLabel"
	tap.text = "TAP TO START"
	Fonts.apply(tap, Fonts.orbitron("Bold"), 12, DesignTokens.NEON_PINK, 4.0)
	tap.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	tap.set_anchors_preset(Control.PRESET_CENTER_BOTTOM)
	tap.anchor_left = 0.0
	tap.anchor_right = 1.0
	tap.offset_top = -78
	tap.offset_bottom = -50
	tap.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(tap)
	var tw := create_tween().set_loops()
	tw.tween_property(tap, "modulate:a", 0.25, 0.375)
	tw.tween_property(tap, "modulate:a", 1.0, 0.375)
	gui_input.connect(_on_input)


func _add_dots(root: Control) -> void:
	var dots := [
		{"x": 0.12, "y": 0.18, "c": DesignTokens.NEON_PINK, "sz": 4},
		{"x": 0.84, "y": 0.16, "c": DesignTokens.ELECTRIC_BLUE, "sz": 2},
		{"x": 0.06, "y": 0.50, "c": DesignTokens.PURPLE, "sz": 2},
		{"x": 0.92, "y": 0.46, "c": DesignTokens.CYAN, "sz": 4},
		{"x": 0.22, "y": 0.75, "c": DesignTokens.ORANGE, "sz": 2},
		{"x": 0.78, "y": 0.72, "c": DesignTokens.NEON_PINK, "sz": 2},
		{"x": 0.50, "y": 0.10, "c": DesignTokens.YELLOW, "sz": 4},
		{"x": 0.38, "y": 0.82, "c": DesignTokens.ELECTRIC_BLUE, "sz": 2},
		{"x": 0.65, "y": 0.30, "c": DesignTokens.GREEN, "sz": 2},
	]
	for d in dots:
		var dot := ColorRect.new()
		dot.color = d["c"]
		dot.custom_minimum_size = Vector2(d["sz"], d["sz"])
		dot.mouse_filter = Control.MOUSE_FILTER_IGNORE
		dot.set_anchors_preset(Control.PRESET_TOP_LEFT)
		dot.anchor_left = d["x"]
		dot.anchor_top = d["y"]
		dot.offset_right = d["sz"]
		dot.offset_bottom = d["sz"]
		root.add_child(dot)


func _add_sparks(root: Control) -> void:
	for i in 7:
		var spark := ColorRect.new()
		spark.color = DesignTokens.NEON_PINK if i % 2 == 0 else DesignTokens.CYAN
		spark.modulate.a = 0.65
		spark.custom_minimum_size = Vector2(1.5, 10 + (i % 3) * 7)
		spark.rotation_degrees = -25 + i * 8
		spark.mouse_filter = Control.MOUSE_FILTER_IGNORE
		spark.set_anchors_preset(Control.PRESET_TOP_LEFT)
		spark.anchor_left = (8.0 + i * 13.0) / 100.0
		spark.anchor_top = (28.0 + (i % 4) * 8.0) / 100.0
		root.add_child(spark)


func _on_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed:
		nav("menu")
	elif event is InputEventScreenTouch and event.pressed:
		nav("menu")


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_accept") or (event is InputEventKey and event.pressed and (event.keycode == KEY_SPACE or event.keycode == KEY_ENTER)):
		nav("menu")
		get_viewport().set_input_as_handled()
