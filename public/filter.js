let error = Symbol("parse error")

function * until_(tokens, end, a, b)
{
	for (let token of tokens)
	{
		if (end(token)) { if (a) a() ; return }
		yield token
	}
	if (b) b()
}

let until = (tokens, end) => until_(tokens, end, null, () => { throw error })

let separate = (tokens, separator, a, b) =>
{
	let result = {}
	result.a = a(until_(tokens, separator, () => result.b = b(tokens)))
	return result
}

let tokenize = string =>
{
	string = string.replace(/^[ _+-]+|[ _+-]+$/g, "")
	if (string) return string.split(/[ _+-]+|\b|(?=[!()[\]"'“”‘’])/g)[Symbol.iterator]()
}

let parse = tokens =>
{
	let parseList = tokens =>
	{
		let {a, b} = separate(tokens, t => t === ",", parseOr, parseList)
		if (!b) return a
		return check => a(check) && b(check)
	}
	
	let parseOr = tokens =>
	{
		let {a, b} = separate(tokens, t => t === "or" || t === "||" || t === "|", parseAnd, parseOr)
		if (!b) return a
		return check => a(check) || b(check)
	}
	
	let parseAnd = tokens =>
	{
		let {a, b} = separate(tokens, t => t === "and" || t === "&&" || t === "&", parseAtom, parseAnd)
		if (!b) return a
		return check => a(check) && b(check)
	}
	
	let parseAtom = tokens =>
	{
		let {value, done} = tokens.next()
		if (done) throw error
		
		let parseGroup_ = ([a, b]) =>
		{
			if (value === a)
			{
				let f = parseGroup(t => t === b)
				if (!tokens.next().done) throw error
				return f
			}
		}
		
		let group =
			parseGroup_("()") ||
			parseGroup_("[]") ||
			parseGroup_('""') ||
			parseGroup_("''") ||
			parseGroup_("“”") ||
			parseGroup_("‘’")
		if (group) return group
		
		if (value === "not" || value === "!")
		{
			let f = parseAtom(tokens)
			return check => !f(check)
		}
		
		let valid = p => /^[a-z]+$/.test(p)
		if (!valid(value)) throw error
		
		for (let token of tokens)
		{
			if (!valid(token)) throw error
			value += " " + token
		}
		
		return check => check(value)
	}
	
	let parseGroup = end => parseAll(until(tokens, end))
	
	let parseAll = parseList
	
	if (!tokens) return () => true
	
	let f
	try { f = parseAll(tokens) }
	catch (e) { if (e !== error) throw e }
	if (tokens.next().done) return f
}

export default string => parse(tokenize(string))
