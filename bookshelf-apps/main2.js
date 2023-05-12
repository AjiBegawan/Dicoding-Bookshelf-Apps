const books = []
const RENDER_EVENT = 'render-library'
const LIBRARY_KEY = 'LIBRARY'
const SAVE_BOOK = 'save-book'

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook')
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault()
        collectBook()
    })

    const searchForm = document.getElementById('searchBook')
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault()
        searchBooks()
    })

    if (isStorageExist()) {
        loadLibraryFromStorage()
    }
})

function collectBook() {
    const id = generateId()
    const title = document.getElementById('inputBookTitle').value
    const author = document.getElementById('inputBookAuthor').value
    const year = document.getElementById('inputBookYear').value
    const isComplete = document.querySelector('#inputBookIsComplete').checked

    if (seachBookByTitle(title)) {
        alert('Book title has been registered. Please search your book in search bar!!!')
        clearField()
        return null
    }

    const booksObject = generateBookObject(id, title, author, year, isComplete)
    books.push(booksObject)
    document.dispatchEvent(new Event(RENDER_EVENT))

    clearField()
    saveLibrary()
}

function clearField() {
    document.getElementById('inputBookTitle').value = ''
    document.getElementById('inputBookAuthor').value = ''
    document.getElementById('inputBookYear').value = ''
    document.querySelector('#inputBookIsComplete').checked = false
}

function generateId() {
    return +new Date()
}

function generateBookObject(id, title, author, year, isComplete) {
    return { id, title, author, year, isComplete }
}

document.addEventListener(RENDER_EVENT, function () {
    const read = document.getElementById('completeBookshelfList')
    const unread = document.getElementById('incompleteBookshelfList')

    read.innerHTML = ''
    unread.innerHTML = ''

    for (const bookItem of books) {
        const bookElement = createBookCard(bookItem)

        if (bookItem.isComplete) {
            read.append(bookElement)
        } else {
            unread.append(bookElement)
        }
    }
})

function createBookCard(bookItem) {
    const bookTitle = document.createElement('h3')
    const bookAuthor = document.createElement('p')
    const bookYear = document.createElement('p')
    const actionContainer = document.createElement('div')
    const container = document.createElement('article')
    const readButton = document.createElement('button')
    const unreadButton = document.createElement('button')
    const editButton = document.createElement('button')
    const deleteButton = document.createElement('button')

    bookTitle.innerText = bookItem.title
    bookAuthor.innerText = bookItem.author
    bookYear.innerHTML = bookItem.year
    editButton.innerText = 'Edit judul buku'
    deleteButton.innerText = 'Hapus Buku'

    actionContainer.classList.add('action')
    container.classList.add('book_item')
    editButton.classList.add('blue')
    deleteButton.classList.add('red')

    if (bookItem.isComplete) {
        unreadButton.innerText = 'Belum selesai di Baca'
        unreadButton.classList.add('green')

        unreadButton.addEventListener('click', function () {
            switchIsCompleteStatus(bookItem.id)
        })
        editButton.addEventListener('click', function () {
            editBookTitle(bookItem.id)
        })
        deleteButton.addEventListener('click', function () {
            if (deleteValidation(bookItem.title)) {
                deleteBook(bookItem.id)
            }
        })
        actionContainer.append(unreadButton, editButton, deleteButton)
    } else {
        readButton.innerText = 'Selesai dibaca'
        readButton.classList.add('green')

        readButton.addEventListener('click', function () {
            switchIsCompleteStatus(bookItem.id)

        })
        editButton.addEventListener('click', function () {
            editBookTitle(bookItem.id)
        })
        deleteButton.addEventListener('click', function () {
            if (deleteValidation(bookItem.title)) {
                deleteBook(bookItem.id)
            }
        })
        actionContainer.append(readButton, editButton, deleteButton)
    }
    container.append(bookTitle, bookAuthor, bookYear, actionContainer)
    return container
}

function switchIsCompleteStatus(bookId) {
    const targetBook = findBook(bookId)
    if (targetBook != null) {
        if (!targetBook.isComplete) {
            targetBook.isComplete = true
        } else {
            targetBook.isComplete = false
        }
    } else {
        return null
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveLibrary()
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem
        }
    }
    return null
}

function deleteBook(bookId) {
    const targetBook = findBookIndex(bookId)
    if (targetBook == -1) return
    books.splice(targetBook, 1)
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveLibrary()
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index
        }
    }
    return -1
}

function deleteValidation(bookTitle) {
    if (confirm(`Delete ${bookTitle} ?`)) {
        return true
    } else {
        return false
    }
}

function editBookTitle(bookId) {
    const newBookTitle = prompt("Please enter new book title:");
    const targetBook = findBook(bookId);
    if (targetBook == null) return;
    targetBook.title = newBookTitle;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveLibrary()
}

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Sorry, your browser does not support local storage. Please use another browser. ')
        return false
    }
    return true
}

function saveLibrary() {
    if (isStorageExist()) {
        const bookParsed = JSON.stringify(books)
        localStorage.setItem(LIBRARY_KEY, bookParsed)
        document.dispatchEvent(new Event(SAVE_BOOK))
    }
}

document.addEventListener(SAVE_BOOK, function () {
    console.log(localStorage.getItem(LIBRARY_KEY));
})

function loadLibraryFromStorage() {
    const dataFromStorage = localStorage.getItem(LIBRARY_KEY)
    const booksList = JSON.parse(dataFromStorage)
    if (booksList !== null) {
        for (const book of booksList) {
            books.push(book)
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT))
}

function searchBooks() {
    const titleInput = document.getElementById('searchBookTitle').value
    const bookResult = seachBookByTitle(titleInput)
    if (bookResult == null) {
        const showCard = document.getElementById('bookResult')
        showCard.classList.remove('book_shelf')
        showCard.innerHTML = ''
        alert('The book you were looking for could not be found')
    } else {
        const searchContainer = showSearchBooks(bookResult)
        const showCard = document.getElementById('bookResult')
        showCard.classList.add('book_shelf')
        showCard.append(searchContainer)
    }
}

function seachBookByTitle(titleInput) {
    for (const title of books) {
        if (title.title === titleInput) {
            return title
        }
    }
    return null
}

function showSearchBooks(book) {
    const container = document.createElement('article')
    const bookTitle = document.createElement('h3')
    const bookAuthor = document.createElement('p')
    const bookYear = document.createElement('p')

    bookTitle.innerText = book.title
    bookAuthor.innerText = book.author
    bookYear.innerHTML = book.year

    container.classList.add('book_item')
    container.append(bookTitle, bookAuthor, bookYear)

    return container
}