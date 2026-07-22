class_name PauseModal
extends Control
## Pause overlay — does not pause SceneTree so buttons keep working.

signal resume_pressed
signal restart_pressed
signal settings_pressed
signal quit_pressed


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP
	var dim := ColorRect.new()
	dim.color = Color(0.02, 0.024, 0.09, 0.88)
	dim.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(dim)
	var center := CenterContainer.new()
	center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(center)
	var modal := PanelContainer.new()
	modal.custom_minimum_size = Vector2(300, 0)
	var sb := DesignTokens.make_panel_style(DesignTokens.CARD, DesignTokens.with_alpha(DesignTokens.NEON_PINK, 0.4), DesignTokens.RADIUS_MODAL, 2)
	sb.shadow_color = DesignTokens.with_alpha(DesignTokens.NEON_PINK, 0.27)
	sb.shadow_size = 24
	sb.content_margin_left = 24
	sb.content_margin_right = 24
	sb.content_margin_top = 28
	sb.content_margin_bottom = 28
	modal.add_theme_stylebox_override("panel", sb)
	center.add_child(modal)
	var col := VBoxContainer.new()
	col.add_theme_constant_override("separation", 12)
	modal.add_child(col)
	var title := Label.new()
	title.text = "PAUSED"
	Fonts.apply(title, Fonts.orbitron("Black"), 28, DesignTokens.NEON_PINK, 3.0)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(title)
	col.add_child(_btn("RESUME", DesignTokens.NEON_PINK, "play", NeonButton.ButtonSize.LARGE, resume_pressed))
	col.add_child(_btn("RESTART RUN", DesignTokens.ORANGE, "restart", NeonButton.ButtonSize.NORMAL, restart_pressed))
	col.add_child(_btn("SETTINGS", DesignTokens.ELECTRIC_BLUE, "settings", NeonButton.ButtonSize.NORMAL, settings_pressed))
	var quit := SecondaryButton.new()
	quit.configure("QUIT TO MENU", "home")
	quit.pressed_nav.connect(func() -> void: quit_pressed.emit())
	col.add_child(quit)


func _btn(text: String, color: Color, icon: String, size: NeonButton.ButtonSize, sig: Signal) -> NeonButton:
	var b := NeonButton.new()
	b.configure(text, color, size, icon, true)
	b.pressed_nav.connect(func() -> void: sig.emit())
	return b
