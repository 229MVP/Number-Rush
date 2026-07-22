class_name UIFactory
extends RefCounted
## Helpers for neon UI construction matching App.tsx.


static func glow_label(text: String, font: Font, size: int, color: Color, glow_color: Color, glow_size: int = 2) -> Control:
	var wrap := Control.new()
	wrap.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var shadow := Label.new()
	shadow.text = text
	Fonts.apply(shadow, font, size, DesignTokens.with_alpha(glow_color, 0.55))
	shadow.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	shadow.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	shadow.position = Vector2(0, glow_size)
	shadow.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var main := Label.new()
	main.name = "Main"
	main.text = text
	Fonts.apply(main, font, size, color)
	main.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	main.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	main.mouse_filter = Control.MOUSE_FILTER_IGNORE
	wrap.add_child(shadow)
	wrap.add_child(main)
	return wrap


static func set_label_glow_text(wrap: Control, text: String) -> void:
	for c in wrap.get_children():
		if c is Label:
			(c as Label).text = text


static func full_rect(node: Control) -> void:
	node.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	node.mouse_filter = Control.MOUSE_FILTER_IGNORE


static func vbox(gap: int = 0) -> VBoxContainer:
	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", gap)
	return box


static func hbox(gap: int = 0) -> HBoxContainer:
	var box := HBoxContainer.new()
	box.add_theme_constant_override("separation", gap)
	return box


static func muted_caption(text: String, size: int = 9) -> Label:
	var l := Label.new()
	l.text = text
	Fonts.apply(l, Fonts.rajdhani("Bold"), size, DesignTokens.MUTED, 1.5)
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	return l


static func style_button_flat(btn: Button, bg: Color, border: Color, radius: int = 10, border_w: int = 1) -> void:
	var normal := DesignTokens.make_panel_style(bg, border, float(radius), border_w)
	var hover := DesignTokens.make_panel_style(bg.lightened(0.08), border, float(radius), border_w)
	var pressed := DesignTokens.make_panel_style(bg.darkened(0.08), border, float(radius), border_w)
	btn.add_theme_stylebox_override("normal", normal)
	btn.add_theme_stylebox_override("hover", hover)
	btn.add_theme_stylebox_override("pressed", pressed)
	btn.add_theme_stylebox_override("focus", normal)
	btn.add_theme_stylebox_override("disabled", DesignTokens.make_panel_style(DesignTokens.with_alpha(bg, 0.4), DesignTokens.with_alpha(border, 0.3), float(radius), border_w))
