class_name ToggleSwitch
extends Control
## 40×22 pink toggle matching Settings.

signal toggled(is_on: bool)

@export var is_on: bool = false

var _track: Panel
var _thumb: Panel


func _ready() -> void:
	custom_minimum_size = Vector2(40, 22)
	mouse_filter = Control.MOUSE_FILTER_STOP
	mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	_track = Panel.new()
	_track.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_track.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_track)
	_thumb = Panel.new()
	_thumb.custom_minimum_size = Vector2(16, 16)
	_thumb.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var thumb_sb := StyleBoxFlat.new()
	thumb_sb.bg_color = DesignTokens.WHITE
	thumb_sb.set_corner_radius_all(8)
	thumb_sb.shadow_color = Color(0, 0, 0, 0.4)
	thumb_sb.shadow_size = 2
	_thumb.add_theme_stylebox_override("panel", thumb_sb)
	add_child(_thumb)
	_apply(false)
	gui_input.connect(_on_input)


func set_on(v: bool, animate: bool = true) -> void:
	is_on = v
	if is_inside_tree() and _track != null:
		_apply(animate)


func _apply(animate: bool) -> void:
	if _track == null or _thumb == null:
		return
	var track_sb := StyleBoxFlat.new()
	track_sb.set_corner_radius_all(11)
	track_sb.border_width_left = 1
	track_sb.border_width_top = 1
	track_sb.border_width_right = 1
	track_sb.border_width_bottom = 1
	if is_on:
		track_sb.bg_color = DesignTokens.NEON_PINK
		track_sb.border_color = DesignTokens.NEON_PINK
		track_sb.shadow_color = DesignTokens.with_alpha(DesignTokens.NEON_PINK, 0.47)
		track_sb.shadow_size = 6
	else:
		track_sb.bg_color = DesignTokens.with_alpha(DesignTokens.MUTED, 0.2)
		track_sb.border_color = DesignTokens.with_alpha(DesignTokens.MUTED, 0.2)
	_track.add_theme_stylebox_override("panel", track_sb)
	var target_x := 19.0 if is_on else 2.0
	if animate and is_inside_tree():
		var tw := create_tween()
		tw.tween_property(_thumb, "position", Vector2(target_x, 3), 0.2)
	else:
		_thumb.position = Vector2(target_x, 3)


func _on_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		set_on(not is_on, true)
		toggled.emit(is_on)
	elif event is InputEventScreenTouch and event.pressed:
		set_on(not is_on, true)
		toggled.emit(is_on)
