const url_apiSearchRepo=new URL("https://api.github.com/search/repositories")
const searchField = document.getElementById("search-request")
const suggestions = document.querySelector("label > .suggestion-list")
const repoList = document.querySelector("section.list-container")
const searchResults = []
let lastRequest
let inputTimeout

searchField.onkeyup = e=>{
  if (e.keyCode == 27) {
    searchField.value = ""
    lastRequest = ""
    suggestions.innerHTML = ""
    return
  }
  inputTimeout = setTimeout(()=>{
    if (lastRequest != searchField.value) {
      lastRequest = searchField.value
      searchResults.length = 0
      url_apiSearchRepo.searchParams.set("q", searchField.value)
      fetch(url_apiSearchRepo)
      .then(response=>response.json())
      .then(result=>result.items.slice(0,5).map(item=>{
        const {name, owner: {login: owner}, stargazers_count: stars} = item
        return {name, owner, stars}
      }))
      .then(result=>{
        searchResults.push(...result)
        suggestions.innerHTML=""
        for (const repo of searchResults) {
          suggestions.innerHTML+=`<li>${repo.name}</li>`
        }
      })
      .catch(err=>{
        document.write(err)
      })
    }
  }, 2000)
}

searchField.onkeydown = ()=>{
  clearTimeout(inputTimeout)
  if (searchField.value.length == 0) {
    lastRequest = ""
    suggestions.innerHTML=""
  }
}

suggestions.onclick = e=>{
  const idx = Array.from(suggestions.children).indexOf(e.target)
  const info = searchResults[idx]
  console.log(info)
  const domElement = document.createElement("div")
  domElement.innerHTML=`<h2>${info.name}</h2>
<button type="button" title="remove repo from list"></button>
<p>Owner: ${info.owner}</p>
<p>Stars: ${info.stars}</p>`
  repoList.appendChild(domElement)
  suggestions.innerHTML=""
  searchField.value=""
  lastRequest=""
}

repoList.onclick = e=>{
  let target = e.target
  if (target.tagName != "BUTTON") return
  target = target.closest("div")
  target.parentElement.removeChild(target)
}
