extends SceneTree
func _init() -> void:
	var f: Font = load("res://assets/fonts/Orbitron-Variable.ttf")
	print("base height=", f.get_height(16))
	var v := FontVariation.new()
	v.base_font = f
	v.variation_opentype = {0x77676874: 900}
	print("var height=", v.get_height(38))
	quit()
