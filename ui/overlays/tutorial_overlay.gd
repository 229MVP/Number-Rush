class_name TutorialOverlay
extends Control
## Three-step first-run tutorial.

signal completed

var step: int = 1
var _step_label: Label
var _body: Label
var _dots: Array[ColorRect] = []
var _next_btn: NeonButton


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP
	var dim := ColorRect.new()
	dim.color = Color(0.02, 0.024, 0.09, 0.82)
	dim.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(dim)
	var bottom := MarginContainer.new()
	bottom.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	bottom.add_theme_constant_override("margin_bottom", 60)
	bottom.add_theme_constant_override("margin_left", 45)
	bottom.add_theme_constant_override("margin_right", 45)
	add_child(bottom)
	var align := VBoxContainer.new()
	align.alignment = BoxContainer.ALIGNMENT_END
	bottom.add_child(align)
	var card := PanelContainer.new()
	card.custom_minimum_size = Vector2(300, 0)
	var sb := DesignTokens.make_panel_style(DesignTokens.CARD, DesignTokens.with_alpha(DesignTokens.CYAN, 0.4), 18.0, 2)
	sb.shadow_color = DesignTokens.with_alpha(DesignTokens.CYAN, 0.2)
	sb.shadow_size = 18
	sb.content_margin_left = 22
	sb.content_margin_right = 22
	sb.content_margin_top = 20
	sb.content_margin_bottom = 20
	card.add_theme_stylebox_override("panel", sb)
	align.add_child(card)
	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 12)
	card.add_child(col)
	_step_label = Label.new()
	Fonts.apply(_step_label, Fonts.orbitron("Bold"), 11, DesignTokens.CYAN, 1.0)
	_step_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(_step_label)
	_body = Label.new()
	Fonts.apply(_body, Fonts.rajdhani("SemiBold"), 16, DesignTokens.WHITE)
	_body.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_body.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	col.add_child(_body)
	var dots := HBoxContainer.new()
	dots.alignment = BoxContainer.ALIGNMENT_CENTER
	dots.add_theme_constant_override("separation", 6)
	col.add_child(dots)
	for i in 3:
		var d := ColorRect.new()
		d.custom_minimum_size = Vector2(7, 7)
		d.color = DesignTokens.with_alpha(DesignTokens.MUTED, 0.33)
		dots.add_child(d)
		_dots.append(d)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 10)
	col.add_child(row)
	var skip := Button.new()
	skip.text = "SKIP"
	skip.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	UIFactory.style_button_flat(skip, Color(0, 0, 0, 0), DesignTokens.with_alpha(DesignTokens.MUTED, 0.27), 8, 1)
	skip.add_theme_font_override("font", Fonts.rajdhani("Bold"))
	skip.add_theme_font_size_override("font_size", 12)
	skip.add_theme_color_override("font_color", DesignTokens.MUTED)
	skip.pressed.connect(_finish)
	row.add_child(skip)
	_next_btn = NeonButton.new()
	_next_btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_next_btn.size_flags_stretch_ratio = 2.0
	_next_btn.configure("NEXT →", DesignTokens.CYAN, NeonButton.ButtonSize.NORMAL, "", true)
	_next_btn.pressed_nav.connect(_on_next)
	row.add_child(_next_btn)
	_refresh()


func _refresh() -> void:
	_step_label.text = "STEP %d OF 3" % step
	match step:
		1:
			_body.text = "This is your current number."
		2:
			_body.text = "Tap a lane to add the number."
		_:
			_body.text = "Reach exactly 21 to clear the lane!"
	for i in _dots.size():
		var on: bool = (i + 1) == step
		_dots[i].custom_minimum_size = Vector2(18 if on else 7, 7)
		_dots[i].color = DesignTokens.CYAN if on else DesignTokens.with_alpha(DesignTokens.MUTED, 0.33)
	_next_btn.configure("GOT IT!" if step >= 3 else "NEXT →", DesignTokens.CYAN, NeonButton.ButtonSize.NORMAL, "", true)


func _on_next() -> void:
	if step < 3:
		step += 1
		_refresh()
	else:
		_finish()


func _finish() -> void:
	SaveService.complete_tutorial()
	completed.emit()
	queue_free()
