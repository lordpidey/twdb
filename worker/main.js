import {getAssetFromKV} from "@cloudflare/kv-asset-handler"

let respond = async event =>
{
	try { return await route(event) }
	catch (e) { return new Response("internal error", {status: 500}) }
}

let available = ["/", "/features.js", "/filter.js", "/load.js", "/style.css", "/tmp/ids.html", "/tmp/tagging.html"]

let route = async event =>
{
	let {request} = event
	
	if (request.method !== "GET" && request.method !== "HEAD")
		return new Response("improper method", {status: 400})
	
	let {pathname} = new URL(request.url)
	
	let match
	let temp
	
	if (pathname === "/db.js")
		return new Response(await twdb.get("db.js", "stream"), {headers: {"content-type": "text/javascript"}})
	
	if (available.includes(pathname))
		return getAssetFromKV(event)
	
	if (match = pathname.match(/^\/([0-9]+\.(png|jpeg|mp4))$/))
	if (temp = await twdb.get(match[1], "stream"))
		return new Response(temp, {headers: {"content-type": mime(match[2])}})
	
	if (match = pathname.match(/^\/(th[0-9]+\.png)$/))
	if (temp = await twdb.get(match[1], "stream"))
		return new Response(temp, {headers: {"content-type": "image/png"}})
	
	if (match = pathname.match(/^\/th([0-9]+\.mp4)$/))
	if (await twdb.get(match[1], "stream"))
		return new Response("", {status: 303, headers: {"location": "/" + match[1]}})
	
	return new Response("not found", {status: 404})
}

let mime = type =>
{
	if (type === "png") return "image/png"
	if (type === "jpeg") return "image/jpeg"
	if (type === "mp4") return "video/mp4"
	throw new Error()
}

addEventListener("fetch", event => event.respondWith(respond(event)))
