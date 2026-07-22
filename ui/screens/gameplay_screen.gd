extends ScreenBase
## Gameplay HUD + lanes + tiles connected to GameState.

var _score_label: Label
var _combo_label: Label
var _strikes: StrikeIndicator
var _target: TargetPanel
var _lanes: Array[LaneCard] = []
var _current_tile: NumberTile
var _next_tile: NumberTile
var _multi_btn: Button
var _swap_qty: Label
var _multi_qty: Label
var _multi_selected: bool = false
var _popup_layer: Control
var _pause_modal: PauseModal
var _debug_banner: Label
var _busy: bool = false


func on_enter(_payload: Dictionary = {}) -> void:
	screen_id = "gameplay"
	if not GameState.is_running and not GameState.debug_reference:
		GameState.start_run(GameState.Mode.CLASSIC, 21)
	_build()
	_bind()
	_refresh_all()
	if not SaveService.tutorial_completed and not GameState.debug_reference:
		_show_tutorial()


func on_exit() -> void:
	_unbind()


func _bind() -> void:
	GameState.score_changed.connect(_on_score)
	GameState.combo_changed.connect(_on_combo)
	GameState.strikes_changed.connect(_on_strikes)
	GameState.tile_changed.connect(_on_tiles)
	GameState.lane_updated.connect(_on_lane)
	GameState.run_ended.connect(_on_run_ended)
	GameState.debug_reference_toggled.connect(_on_debug)


func _unbind() -> void:
	if GameState.score_changed.is_connected(_on_score):
		GameState.score_changed.disconnect(_on_score)
	if GameState.combo_changed.is_connected(_on_combo):
		GameState.combo_changed.disconnect(_on_combo)
	if GameState.strikes_changed.is_connected(_on_strikes):
		GameState.strikes_changed.disconnect(_on_strikes)
	if GameState.tile_changed.is_connected(_on_tiles):
		GameState.tile_changed.disconnect(_on_tiles)
	if GameState.lane_updated.is_connected(_on_lane):
		GameState.lane_updated.disconnect(_on_lane)
	if GameState.run_ended.is_connected(_on_run_ended):
		GameState.run_ended.disconnect(_on_run_ended)
	if GameState.debug_reference_toggled.is_connected(_on_debug):
		GameState.debug_reference_toggled.disconnect(_on_debug)


func _build() -> void:
	for c in get_children():
		c.queue_free()
	_lanes.clear()
	var root := Control.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(root)
	var bg := ColorRect.new()
	bg.color = DesignTokens.BG
	bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.add_child(bg)
	var grid := GridBackground.new()
	grid.opacity = 0.05
	root.add_child(grid)
	_popup_layer = Control.new()
	_popup_layer.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_popup_layer.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(_popup_layer)
	var col := VBoxContainer.new()
	col.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	col.add_theme_constant_override("separation", 0)
	root.add_child(col)
	col.add_child(_build_hud())
	var target_wrap := MarginContainer.new()
	target_wrap.add_theme_constant_override("margin_top", 8)
	target_wrap.add_theme_constant_override("margin_bottom", 6)
	var target_center := CenterContainer.new()
	_target = TargetPanel.new()
	target_center.add_child(_target)
	target_wrap.add_child(target_center)
	col.add_child(target_wrap)
	var lanes_margin := MarginContainer.new()
	lanes_margin.add_theme_constant_override("margin_left", 10)
	lanes_margin.add_theme_constant_override("margin_right", 10)
	col.add_child(lanes_margin)
	var lanes_row := HBoxContainer.new()
	lanes_row.add_theme_constant_override("separation", 7)
	lanes_row.custom_minimum_size = Vector2(0, 248)
	lanes_margin.add_child(lanes_row)
	for i in 4:
		var lane := LaneCard.new()
		lane.lane_index = i
		lane.lane_pressed.connect(_on_lane_pressed)
		lanes_row.add_child(lane)
		_lanes.append(lane)
	col.add_child(_build_tiles_row())
	col.add_child(_build_power_row())
	var pgrid := PerspectiveGrid.new()
	pgrid.custom_minimum_size = Vector2(0, 100)
	col.add_child(pgrid)
	_debug_banner = Label.new()
	_debug_banner.text = "DEBUG REFERENCE STATE"
	Fonts.apply(_debug_banner, Fonts.orbitron("Bold"), 10, DesignTokens.YELLOW)
	_debug_banner.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_debug_banner.visible = false
	col.add_child(_debug_banner)


func _build_hud() -> PanelContainer:
	var hud := PanelContainer.new()
	var sb := StyleBoxFlat.new()
	sb.bg_color = DesignTokens.with_alpha(DesignTokens.BG_SECONDARY, 0.8)
	sb.border_width_bottom = 1
	sb.border_color = DesignTokens.BLUE_BORDER_SOFT
	sb.content_margin_left = 12
	sb.content_margin_right = 12
	sb.content_margin_top = 10
	sb.content_margin_bottom = 6
	hud.add_theme_stylebox_override("panel", sb)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 8)
	hud.add_child(row)
	var pause := NeonIconButton.new()
	pause.configure("pause", DesignTokens.NEON_PINK, 44, true)
	pause.pressed_nav.connect(_open_pause)
	row.add_child(pause)
	var score_box := VBoxContainer.new()
	score_box.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	score_box.add_child(UIFactory.muted_caption("SCORE", 9))
	_score_label = Label.new()
	_score_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	Fonts.apply(_score_label, Fonts.orbitron("ExtraBold"), 19, DesignTokens.WHITE)
	score_box.add_child(_score_label)
	row.add_child(score_box)
	var combo_box := VBoxContainer.new()
	combo_box.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	combo_box.add_child(UIFactory.muted_caption("COMBO", 9))
	_combo_label = Label.new()
	_combo_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	Fonts.apply(_combo_label, Fonts.orbitron("ExtraBold"), 17, DesignTokens.ORANGE)
	combo_box.add_child(_combo_label)
	row.add_child(combo_box)
	var strikes_box := VBoxContainer.new()
	strikes_box.add_child(UIFactory.muted_caption("STRIKES", 9))
	_strikes = StrikeIndicator.new()
	strikes_box.add_child(_strikes)
	row.add_child(strikes_box)
	return hud


func _build_tiles_row() -> MarginContainer:
	var m := MarginContainer.new()
	m.add_theme_constant_override("margin_top", 10)
	m.add_theme_constant_override("margin_bottom", 4)
	m.add_theme_constant_override("margin_left", 16)
	m.add_theme_constant_override("margin_right", 16)
	var row := HBoxContainer.new()
	row.alignment = BoxContainer.ALIGNMENT_CENTER
	row.add_theme_constant_override("separation", 16)
	m.add_child(row)
	var cur_col := VBoxContainer.new()
	cur_col.alignment = BoxContainer.ALIGNMENT_CENTER
	cur_col.add_theme_constant_override("separation", 4)
	cur_col.add_child(UIFactory.muted_caption("CURRENT TILE", 9))
	_current_tile = NumberTile.new()
	_current_tile.kind = NumberTile.TileKind.CURRENT
	cur_col.add_child(_current_tile)
	row.add_child(cur_col)
	var next_col := VBoxContainer.new()
	next_col.alignment = BoxContainer.ALIGNMENT_CENTER
	next_col.add_theme_constant_override("separation", 4)
	next_col.add_child(UIFactory.muted_caption("NEXT", 9))
	_next_tile = NumberTile.new()
	_next_tile.kind = NumberTile.TileKind.NEXT
	next_col.add_child(_next_tile)
	row.add_child(next_col)
	return m


func _build_power_row() -> MarginContainer:
	var m := MarginContainer.new()
	m.add_theme_constant_override("margin_left", 16)
	m.add_theme_constant_override("margin_right", 16)
	m.add_theme_constant_override("margin_top", 4)
	m.add_theme_constant_override("margin_bottom", 4)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 8)
	m.add_child(row)
	_multi_btn = Button.new()
	_multi_btn.custom_minimum_size = Vector2(88, 44)
	_style_power(_multi_btn, DesignTokens.ORANGE)
	_multi_btn.pressed.connect(_toggle_multi)
	var multi_row := HBoxContainer.new()
	multi_row.add_theme_constant_override("separation", 7)
	multi_row.mouse_filter = Control.MOUSE_FILTER_IGNORE
	multi_row.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_multi_btn.add_child(multi_row)
	var x2 := Label.new()
	x2.text = "x2"
	Fonts.apply(x2, Fonts.orbitron("Black"), 14, DesignTokens.ORANGE)
	multi_row.add_child(x2)
	var multi_txt := VBoxContainer.new()
	var ml := Label.new()
	ml.text = "MULTI"
	Fonts.apply(ml, Fonts.rajdhani("Bold"), 9, DesignTokens.ORANGE)
	multi_txt.add_child(ml)
	_multi_qty = Label.new()
	_multi_qty.text = "×%d left" % int(SaveService.inventory.get("multiplier", 0))
	Fonts.apply(_multi_qty, Fonts.rajdhani("SemiBold"), 9, DesignTokens.MUTED)
	multi_txt.add_child(_multi_qty)
	multi_row.add_child(multi_txt)
	multi_row.add_child(IconService.make_texture_rect("zap", 13, DesignTokens.ORANGE))
	row.add_child(_multi_btn)
	var instr := VBoxContainer.new()
	instr.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	var i1 := Label.new()
	i1.text = "TAP A LANE TO PLACE THE TILE"
	Fonts.apply(i1, Fonts.rajdhani("Bold"), 11, DesignTokens.WHITE)
	i1.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	instr.add_child(i1)
	var i2 := Label.new()
	i2.text = "Hit exactly 21. Don't go over."
	Fonts.apply(i2, Fonts.rajdhani("Regular"), 9, DesignTokens.MUTED)
	i2.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	instr.add_child(i2)
	row.add_child(instr)
	var swap := Button.new()
	swap.custom_minimum_size = Vector2(88, 44)
	_style_power(swap, DesignTokens.ELECTRIC_BLUE)
	swap.pressed.connect(_on_swap)
	var swap_row := HBoxContainer.new()
	swap_row.add_theme_constant_override("separation", 7)
	swap_row.mouse_filter = Control.MOUSE_FILTER_IGNORE
	swap_row.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	swap.add_child(swap_row)
	swap_row.add_child(IconService.make_texture_rect("shuffle", 15, DesignTokens.ELECTRIC_BLUE))
	var swap_txt := VBoxContainer.new()
	var sl := Label.new()
	sl.text = "SWAP"
	Fonts.apply(sl, Fonts.rajdhani("Bold"), 9, DesignTokens.ELECTRIC_BLUE)
	swap_txt.add_child(sl)
	_swap_qty = Label.new()
	_swap_qty.text = "×%d left" % int(SaveService.inventory.get("swap", 0))
	Fonts.apply(_swap_qty, Fonts.rajdhani("SemiBold"), 9, DesignTokens.MUTED)
	swap_txt.add_child(_swap_qty)
	swap_row.add_child(swap_txt)
	row.add_child(swap)
	return m


func _style_power(btn: Button, color: Color) -> void:
	var sb := DesignTokens.make_panel_style(DesignTokens.with_alpha(color, 0.09), DesignTokens.with_alpha(color, 0.33), DesignTokens.RADIUS_COMPACT, 2)
	sb.content_margin_left = 12
	sb.content_margin_right = 12
	sb.content_margin_top = 7
	sb.content_margin_bottom = 7
	btn.add_theme_stylebox_override("normal", sb)
	btn.add_theme_stylebox_override("hover", sb)
	btn.add_theme_stylebox_override("pressed", sb)
	btn.add_theme_stylebox_override("focus", sb)


func _refresh_all() -> void:
	_on_score(GameState.score)
	_on_combo(GameState.get_combo_multiplier())
	_on_strikes(GameState.strikes_remaining)
	_on_tiles()
	_target.set_target(GameState.target)
	for i in _lanes.size():
		_lanes[i].update_lane(GameState.lane_totals[i], GameState.target)
		if GameState.debug_reference and i == 2:
			_lanes[i].set_visual_state(LaneCard.LaneVisualState.PERFECT)
		else:
			_lanes[i].reset_visual_state()
	_multi_qty.text = "×%d left" % int(SaveService.inventory.get("multiplier", 0))
	_swap_qty.text = "×%d left" % int(SaveService.inventory.get("swap", 0))
	_debug_banner.visible = GameState.debug_reference


func _on_score(v: int) -> void:
	_score_label.text = _fmt(v)
	var tw := create_tween()
	tw.tween_property(_score_label, "scale", Vector2(1.15, 1.15), 0.12)
	tw.tween_property(_score_label, "scale", Vector2.ONE, 0.12)


func _on_combo(mult: int) -> void:
	var high := mult >= 3
	Fonts.apply(_combo_label, Fonts.orbitron("ExtraBold"), 20 if high else 17, DesignTokens.YELLOW if high else DesignTokens.ORANGE)
	_combo_label.text = ("⚡" if mult >= 3 else "") + "x%d" % mult
	var tw := create_tween()
	tw.tween_property(_combo_label, "scale", Vector2(1.3, 1.3), 0.12)
	tw.tween_property(_combo_label, "scale", Vector2.ONE, 0.18)


func _on_strikes(v: int) -> void:
	_strikes.set_strikes(v)


func _on_tiles() -> void:
	_current_tile.set_value(GameState.current_tile)
	_next_tile.set_value(GameState.next_tile)
	_current_tile.animate_spawn()


func _on_lane(i: int) -> void:
	if i >= 0 and i < _lanes.size():
		_lanes[i].update_lane(GameState.lane_totals[i], GameState.target)


func _on_lane_pressed(idx: int) -> void:
	if _busy or GameState.input_locked or GameState.debug_reference:
		return
	_busy = true
	GameState.input_locked = true
	_lanes[idx].animate_selected()
	await _fly_tile_to_lane(idx)
	var result: String = GameState.place_tile(idx)
	match result:
		"perfect":
			_lanes[idx].animate_perfect()
			_spawn_popup("PERFECT +%d" % GameState.last_points_awarded, idx)
			await get_tree().create_timer(0.9).timeout
			GameState.reset_lane(idx)
			_lanes[idx].reset_visual_state()
		"bust":
			_lanes[idx].animate_bust()
			_spawn_popup("BUST!", idx)
			await get_tree().create_timer(0.9).timeout
			GameState.reset_lane(idx)
			_lanes[idx].reset_visual_state()
		"normal":
			_lanes[idx].animate_received()
			await get_tree().create_timer(0.35).timeout
			_lanes[idx].reset_visual_state()
		_:
			pass
	if GameState.is_running:
		GameState.input_locked = false
	_busy = false
	_multi_qty.text = "×%d left" % int(SaveService.inventory.get("multiplier", 0))
	_swap_qty.text = "×%d left" % int(SaveService.inventory.get("swap", 0))


func _fly_tile_to_lane(idx: int) -> void:
	var ghost := NumberTile.new()
	ghost.kind = NumberTile.TileKind.CURRENT
	ghost.value = GameState.current_tile
	_popup_layer.add_child(ghost)
	ghost.global_position = _current_tile.global_position
	ghost.set_value(GameState.current_tile)
	var target_pos: Vector2 = _lanes[idx].global_position + _lanes[idx].size * 0.5 - ghost.size * 0.5
	var tw := create_tween()
	tw.tween_property(ghost, "global_position", target_pos, 0.22)
	tw.parallel().tween_property(ghost, "scale", Vector2(0.55, 0.55), 0.22)
	await tw.finished
	ghost.queue_free()


func _spawn_popup(text: String, lane_idx: int) -> void:
	var lab := Label.new()
	lab.text = text
	Fonts.apply(lab, Fonts.orbitron("ExtraBold"), 13, DesignTokens.YELLOW, 0.5)
	lab.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_popup_layer.add_child(lab)
	lab.position = Vector2(40 + lane_idx * 80, size.y * 0.38)
	var tw := create_tween()
	tw.tween_property(lab, "position:y", lab.position.y - 56, 1.1)
	tw.parallel().tween_property(lab, "modulate:a", 0.0, 1.1)
	tw.tween_callback(lab.queue_free)


func _toggle_multi() -> void:
	_multi_selected = not _multi_selected
	_style_power(_multi_btn, DesignTokens.ORANGE if not _multi_selected else DesignTokens.YELLOW)


func _on_swap() -> void:
	if GameState.use_swap():
		_swap_qty.text = "×%d left" % int(SaveService.inventory.get("swap", 0))


func _open_pause() -> void:
	if _pause_modal and is_instance_valid(_pause_modal):
		return
	_pause_modal = PauseModal.new()
	add_child(_pause_modal)
	_pause_modal.resume_pressed.connect(func() -> void: _pause_modal.queue_free())
	_pause_modal.restart_pressed.connect(func() -> void:
		_pause_modal.queue_free()
		GameState.start_run(GameState.mode, GameState.target)
		_refresh_all()
	)
	_pause_modal.settings_pressed.connect(func() -> void:
		_pause_modal.queue_free()
		nav("settings")
	)
	_pause_modal.quit_pressed.connect(func() -> void:
		_pause_modal.queue_free()
		GameState.is_running = false
		nav("menu")
	)


func _show_tutorial() -> void:
	var tut := TutorialOverlay.new()
	add_child(tut)
	tut.completed.connect(func() -> void: pass)


func _on_run_ended(won: bool) -> void:
	await get_tree().create_timer(0.35).timeout
	nav("victory" if won else "gameover")


func _on_debug(_on: bool) -> void:
	_refresh_all()


func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_pause") or (event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE):
		if _pause_modal and is_instance_valid(_pause_modal):
			_pause_modal.queue_free()
		else:
			_open_pause()
		get_viewport().set_input_as_handled()
		return
	for i in 4:
		if event.is_action_pressed("lane_%d" % (i + 1)):
			_on_lane_pressed(i)
			get_viewport().set_input_as_handled()
			return


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
