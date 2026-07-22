class_name StrikeIndicator
extends HBoxContainer
## Three heart strike icons.

var _hearts: Array[TextureRect] = []


func _ready() -> void:
	add_theme_constant_override("separation", 3)
	alignment = BoxContainer.ALIGNMENT_CENTER
	for i in 3:
		var h := IconService.make_texture_rect("heart", 17, DesignTokens.NEON_PINK)
		add_child(h)
		_hearts.append(h)
	set_strikes(3)


func set_strikes(remaining: int) -> void:
	if _hearts.is_empty():
		return
	for i in _hearts.size():
		var filled: bool = i < remaining
		_hearts[i].modulate = DesignTokens.NEON_PINK if filled else DesignTokens.with_alpha(DesignTokens.MUTED, 0.3)
		_hearts[i].self_modulate = Color.WHITE
		if filled and remaining == 1 and i == 0:
			_pulse(_hearts[i])
		else:
			_hearts[i].scale = Vector2.ONE


func _pulse(node: Control) -> void:
	var tw := create_tween().set_loops()
	tw.tween_property(node, "scale", Vector2(1.2, 1.2), 0.5)
	tw.tween_property(node, "scale", Vector2.ONE, 0.5)
