import db from "./db.js"
import parse from "./filter.js"

let p = document.querySelector("#media")

let format = n =>
{
	if (n >= 1000) return (n / 1000).toFixed(1) + "K"
	return String(n)
}

let show = entries =>
{
	for (let entry of entries)
	{
		if (entry.element)
		{
			p.append(entry.element)
			continue
		}
		
		let {type, w, h, tags, index, likes, retweets, replies} = entry
		
		let element
		
		if (type === "mp4")
		{
			element = document.createElement("video")
			element.autoplay = true
			element.loop = true
			element.controls = false
			element.muted = true
			element.src = `/th${index}.mp4`
		}
		else
		{
			element = document.createElement("img")
			element.src = `/th${index}.png`
		}
		
		element.style.width = `${w/h * 16}em`
		
		let likesElement = document.createElement("span")
		likesElement.classList.add("likes")
		likesElement.append(format(likes), " likes")
		
		let retweetsElement = document.createElement("span")
		retweetsElement.classList.add("retweets")
		retweetsElement.append(format(retweets), " retweets")
		
		let repliesElement = document.createElement("span")
		repliesElement.classList.add("replies")
		repliesElement.append(format(replies), " replies")
		
		let info = document.createElement("span")
		info.classList.add("info")
		
		info.append(likesElement, " ", retweetsElement, " ", repliesElement)
		
		let a = document.createElement("a")
		a.href = `/${index}.${type}`
		a.append(info, element)
		
		p.append(a)
		
		entry.element = a
	}
}

let error = document.createElement("p")
error.append("Parse error.")
error.classList.add("error")

let noEntries = document.createElement("p")
noEntries.append("No images found.")
noEntries.classList.add("error")

let last

let applyFilter = () =>
{
	if (filter.value === last) return
	
	last = filter.value
	
	media.textContent = ""
	let f = parse(last)
	
	if (f) error.remove()
	else filterForm.append(error), f = () => true
	
	entries = db.filter(({tags}) => f(tag => tags.has(tag)))
	entries.reverse()
	
	if (entries.length === 0) filterForm.append(noEntries)
	else noEntries.remove()
	
	more()
}

let entries

let filterForm = document.querySelector("#filter")
let filter = filterForm.querySelector("input")
filter.addEventListener("blur", applyFilter)
filterForm.addEventListener("submit", e => { e.preventDefault() ; applyFilter() })

let more = () => show(entries.splice(0, 50))

let scrolled = () =>
{
	if (document.body.offsetHeight - scrollY < innerHeight * 2)
		more()
}

addEventListener("scroll", scrolled)
addEventListener("resize", scrolled)

applyFilter()
