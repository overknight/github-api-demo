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
  if (!searchField.value.trim()) {
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
        const docFragment = new DocumentFragment()
        for (const repo of searchResults) {
          const listItem = document.createElement("li")
          listItem.textContent = repo.name
          docFragment.appendChild(listItem)
        }
        suggestions.appendChild(docFragment)
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
  const domElement = document.createElement("div")
  domElement.innerHTML=`<h2></h2>
<button type="button" title="remove repo from list"></button>
<p></p>
<p></p>`
  domElement.children[0].textContent = info.name
  domElement.children[2].textContent = `Owner: ${info.owner}`
  domElement.children[3].textContent = `Stars: ${info.stars}`
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
