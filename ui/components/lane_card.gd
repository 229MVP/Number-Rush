class_name LaneCard
extends PanelContainer
## One gameplay lane card.

enum LaneVisualState { DEFAULT, PRESSED, SELECTED, PERFECT, BUST, FROZEN, DISABLED }

signal lane_pressed(lane_index: int)

@export var lane_index: int = 0

var _total_label: Label
var _need_label: Label
var _state_label: Label
var _badge: Label
var _bar: NeonProgressBar
var _frost: ColorRect
var _snow: TextureRect
var _visual: LaneVisualState = LaneVisualState.DEFAULT
var _total: int = 0
var _target: int = 21
var _shake_tween: Tween


func _ready() -> void:
	custom_minimum_size = Vector2(0, 248)
	size_flags_horizontal = Control.SIZE_EXPAND_FILL
	mouse_filter = Control.MOUSE_FILTER_STOP
	mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	_build()
	gui_input.connect(_on_gui_input)


func _build() -> void:
	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 3)
	margin.add_theme_constant_override("margin_right", 3)
	margin.add_theme_constant_override("margin_top", 8)
	margin.add_theme_constant_override("margin_bottom", 7)
	add_child(margin)
	var col := VBoxContainer.new()
	col.alignment = BoxContainer.ALIGNMENT_BEGIN
	col.add_theme_constant_override("separation", 4)
	margin.add_child(col)

	_badge = Label.new()
	_badge.text = "LANE %d" % (lane_index + 1)
	Fonts.apply(_badge, Fonts.rajdhani("Bold"), 9, DesignTokens.PURPLE)
	_badge.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(_badge)

	_total_label = Label.new()
	_total_label.text = "0"
	Fonts.apply(_total_label, Fonts.orbitron("Black"), 30, DesignTokens.WHITE)
	_total_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(_total_label)

	_need_label = Label.new()
	_need_label.text = "need 21"
	Fonts.apply(_need_label, Fonts.rajdhani("SemiBold"), 9, DesignTokens.MUTED)
	_need_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	col.add_child(_need_label)

	var spacer := Control.new()
	spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
	col.add_child(spacer)

	_bar = NeonProgressBar.new()
	col.add_child(_bar)

	_state_label = Label.new()
	_state_label.visible = false
	_state_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	Fonts.apply(_state_label, Fonts.orbitron("ExtraBold"), 8, DesignTokens.ORANGE, 0.5)
	col.add_child(_state_label)

	_frost = ColorRect.new()
	_frost.color = DesignTokens.with_alpha(DesignTokens.CYAN, 0.07)
	_frost.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_frost.visible = false
	_frost.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_frost)
	_snow = IconService.make_texture_rect("snowflake", 28, DesignTokens.CYAN)
	_snow.visible = false
	_snow.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	add_child(_snow)
	set_visual_state(LaneVisualState.DEFAULT)


func update_lane(total: int, target: int) -> void:
	_total = total
	_target = target
	_total_label.text = str(total)
	var need: int = maxi(0, target - total)
	_need_label.text = "need %d" % need
	_bar.set_pct((float(total) / float(maxi(1, target))) * 100.0)


func set_visual_state(state: LaneVisualState) -> void:
	_visual = state
	var border := DesignTokens.with_alpha(DesignTokens.PURPLE, 0.4)
	var bg := DesignTokens.CARD
	var total_col := DesignTokens.WHITE
	var progress := DesignTokens.NEON_PINK
	_need_label.visible = true
	_state_label.visible = false
	_frost.visible = false
	_snow.visible = false
	match state:
		LaneVisualState.SELECTED:
			border = DesignTokens.NEON_PINK
			bg = DesignTokens.with_alpha(DesignTokens.NEON_PINK, 0.13)
			scale = Vector2(1.04, 1.04)
		LaneVisualState.PERFECT:
			border = DesignTokens.ORANGE
			bg = DesignTokens.with_alpha(DesignTokens.ORANGE, 0.16)
			total_col = DesignTokens.ORANGE
			progress = DesignTokens.ORANGE
			_need_label.visible = false
			_state_label.visible = true
			_state_label.text = "PERFECT!"
			Fonts.apply(_state_label, Fonts.orbitron("ExtraBold"), 8, DesignTokens.ORANGE, 0.5)
			scale = Vector2.ONE
		LaneVisualState.BUST:
			border = DesignTokens.RED
			bg = DesignTokens.with_alpha(DesignTokens.RED, 0.16)
			total_col = DesignTokens.RED
			progress = DesignTokens.RED
			_need_label.visible = false
			_state_label.visible = true
			_state_label.text = "BUST!"
			Fonts.apply(_state_label, Fonts.orbitron("ExtraBold"), 8, DesignTokens.RED, 0.5)
			scale = Vector2.ONE
		LaneVisualState.FROZEN:
			border = DesignTokens.CYAN
			bg = DesignTokens.with_alpha(DesignTokens.CYAN, 0.13)
			total_col = DesignTokens.CYAN
			progress = DesignTokens.CYAN
			_frost.visible = true
			_snow.visible = true
			scale = Vector2.ONE
		LaneVisualState.DISABLED:
			modulate = Color(1, 1, 1, 0.45)
			scale = Vector2.ONE
		_:
			modulate = Color.WHITE
			scale = Vector2.ONE
	var sb := DesignTokens.make_panel_style(bg, border, DesignTokens.RADIUS_CARD, 2)
	if state == LaneVisualState.PERFECT:
		sb.shadow_color = DesignTokens.with_alpha(DesignTokens.ORANGE, 0.45)
		sb.shadow_size = 18
	elif state == LaneVisualState.SELECTED:
		sb.shadow_color = DesignTokens.with_alpha(DesignTokens.NEON_PINK, 0.4)
		sb.shadow_size = 14
	elif state == LaneVisualState.BUST:
		sb.shadow_color = DesignTokens.with_alpha(DesignTokens.RED, 0.4)
		sb.shadow_size = 14
	else:
		sb.shadow_color = DesignTokens.PURPLE_GLOW_FAINT
		sb.shadow_size = 6
	add_theme_stylebox_override("panel", sb)
	Fonts.apply(_total_label, Fonts.orbitron("Black"), 30, total_col)
	Fonts.apply(_badge, Fonts.rajdhani("Bold"), 9, border)
	_bar.set_fill(progress)


func animate_selected() -> void:
	set_visual_state(LaneVisualState.SELECTED)


func animate_received() -> void:
	var tw := create_tween()
	tw.tween_property(self, "scale", Vector2(1.06, 1.06), 0.08)
	tw.tween_property(self, "scale", Vector2.ONE, 0.12)


func animate_perfect() -> void:
	set_visual_state(LaneVisualState.PERFECT)
	var tw := create_tween().set_loops(3)
	tw.tween_property(self, "modulate", Color(1.2, 1.1, 0.9, 1), 0.2)
	tw.tween_property(self, "modulate", Color.WHITE, 0.2)


func animate_bust() -> void:
	set_visual_state(LaneVisualState.BUST)
	if _shake_tween:
		_shake_tween.kill()
	_shake_tween = create_tween()
	var ox := position.x
	_shake_tween.tween_property(self, "position:x", ox - 6, 0.05)
	_shake_tween.tween_property(self, "position:x", ox + 6, 0.05)
	_shake_tween.tween_property(self, "position:x", ox - 4, 0.05)
	_shake_tween.tween_property(self, "position:x", ox + 4, 0.05)
	_shake_tween.tween_property(self, "position:x", ox, 0.05)


func reset_visual_state() -> void:
	set_visual_state(LaneVisualState.DEFAULT)


func _on_gui_input(event: InputEvent) -> void:
	if _visual == LaneVisualState.FROZEN or _visual == LaneVisualState.DISABLED:
		return
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		lane_pressed.emit(lane_index)
	elif event is InputEventScreenTouch and event.pressed:
		lane_pressed.emit(lane_index)
