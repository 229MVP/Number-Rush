class_name Fonts
extends RefCounted
## Central font loading for Orbitron / Rajdhani / Inter

static var _cache: Dictionary = {}


static func orbitron(_weight: String = "Bold") -> Font:
	## Orbitron ships as a variable font; map weight names to axis values.
	var weight_value := 700
	match _weight:
		"Regular":
			weight_value = 400
		"Medium":
			weight_value = 500
		"SemiBold":
			weight_value = 600
		"Bold":
			weight_value = 700
		"ExtraBold":
			weight_value = 800
		"Black":
			weight_value = 900
		_:
			weight_value = 700
	var key := "orbitron_%d" % weight_value
	if _cache.has(key):
		return _cache[key]
	var base := _load_file("res://assets/fonts/Orbitron-Variable.ttf")
	var variation := FontVariation.new()
	variation.base_font = base
	variation.variation_opentype = {0x77676874: weight_value} # 'wght'
	_cache[key] = variation
	return variation


static func rajdhani(weight: String = "Bold") -> Font:
	return _load_file("res://assets/fonts/Rajdhani-%s.ttf" % weight)


static func inter() -> Font:
	return _load_file("res://assets/fonts/Inter-Variable.ttf")


static func _load_file(path: String) -> Font:
	if _cache.has(path):
		return _cache[path]
	var font: Font = load(path) as Font
	if font == null:
		push_warning("Missing font: %s" % path)
		font = SystemFont.new()
	_cache[path] = font
	return font


static func apply(control: Control, font: Font, size: int, color: Color, tracking: float = 0.0) -> void:
	control.add_theme_font_override("font", font)
	control.add_theme_font_size_override("font_size", size)
	control.add_theme_color_override("font_color", color)
	if tracking != 0.0 and control is Label:
		(control as Label).add_theme_constant_override("letter_spacing", int(tracking))
