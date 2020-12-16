export let Series = (names = [], extra = []) =>
{
	let tags1 = [...names, ...extra]
	let tags = () => tags1
	
	let Character = (names1 = [], defaults = {}, extra = []) =>
	{
		let tags1 = names.flatMap(
			series => names1.flatMap(
				char => [char, series, `${char} from ${series}`]
			)
		)
		
		tags1.push(...extra)
		
		defaults = {...defaults}
		if (defaults.breastSize === undefined) defaults.breastSize = 1
		if (defaults.buttSize === undefined) defaults.buttSize = 1
		if (defaults.height === undefined) defaults.height = 1.6
		
		let tags = (overrides, attributes = []) =>
		{
			let
			{
				hair,
				breastSize,
				buttSize,
				height,
			} = {...defaults, ...overrides}
			
			let tags = [...tags1]
			
			for (let char of tags1)
			for (let attribute of attributes)
			{
				tags.push(char + " " + attribute)
			}
			
			for (let char of ["", ...tags1.map(char => char + " ")])
			{
				if (breastSize > defaults.breastSize) tags.push(char + "breast expansion", char + "expansion")
				if (buttSize > defaults.buttSize) tags.push(char + "butt expansion", char + "expansion")
			}
			
			for (let char of ["", ...tags1.map(char => " " + char)])
			{
				if (hair)
					tags.push(
						`${hair.length} ${hair.color} hair` + char,
						`${hair.length} hair` + char,
						`${hair.color} hair` + char,
					)
				
				if (height >= 2) tags.push("giantess" + char)
				
				for (let [part, size] of [["breasts", breastSize], ["butt", buttSize]])
				{
					if (size < 0.625) tags.push("flat " + part + char)
					if (size >= 1.25) tags.push("big " + part + char)
					if (size >= 2.5) tags.push("large " + part + char)
					if (size >= 5) tags.push("huge " + part + char)
					if (size >= 10) tags.push("gigantic " + part + char)
					if (size >= 20) tags.push("impossibly large " + part + char)
				}
			}
			
			return tags
		}
		
		return {tags}
	}
	
	return {tags, Character}
}

export let {Character} = Series()
