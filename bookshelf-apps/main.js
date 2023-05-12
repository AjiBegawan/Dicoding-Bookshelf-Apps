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
    const unread = document.getElementById('incompleteBookshelfList')
    unread.innerHTML = ''

    const read = document.getElementById('completeBookshelfList')
    read.innerHTML = ''

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
    bookTitle.innerText = bookItem.title

    const bookAuthor = document.createElement('p')
    bookAuthor.innerText = bookItem.author

    const bookYear = document.createElement('p')
    bookYear.innerHTML = bookItem.year

    const deleteButton = document.createElement('button')
    deleteButton.innerText = 'Hapus Buku'
    deleteButton.classList.add('red')

    const container = document.createElement('article')
    container.classList.add('book_item')

    if (bookItem.isComplete) {
        const unreadButton = document.createElement('button')
        unreadButton.innerText = 'Belum selesai di Baca'
        unreadButton.classList.add('green')

        unreadButton.addEventListener('click', function () {
            readBookUncompleted(bookItem.id)
        })

        const editButton = document.createElement('button')
        editButton.innerText = 'Edit judul buku'
        editButton.classList.add('blue')

        editButton.addEventListener('click', function () {
            editBookTitle(bookItem.id)
        })

        deleteButton.addEventListener('click', function () {
            if (deleteValidation(bookItem.title)) {
                deleteBook(bookItem.id)
            }
        })

        const actionContainer = document.createElement('div')
        actionContainer.classList.add('action')
        actionContainer.append(unreadButton, editButton, deleteButton)

        container.append(bookTitle, bookAuthor, bookYear, actionContainer)
    } else {
        const readButton = document.createElement('button')
        readButton.innerText = 'Selesai dibaca'
        readButton.classList.add('green')

        readButton.addEventListener('click', function () {
            readBookCompleted(bookItem.id)
        })

        const editButton = document.createElement('button')
        editButton.innerText = 'Edit judul buku'
        editButton.classList.add('blue')

        editButton.addEventListener('click', function () {
            editBookTitle(bookItem.id)
        })

        deleteButton.addEventListener('click', function () {
            if (deleteValidation(bookItem.title)) {
                deleteBook(bookItem.id)
            }
        })

        const actionContainer = document.createElement('div')
        actionContainer.classList.add('action')
        actionContainer.append(readButton, editButton, deleteButton)

        container.append(bookTitle, bookAuthor, bookYear, actionContainer)
    }

    return container
}

function readBookCompleted(bookId) {
    const targetBook = findBook(bookId);
    if (targetBook == null) return;
    targetBook.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveLibrary()
}

function readBookUncompleted(bookId) {
    const targetBook = findBook(bookId);
    if (targetBook == null) return;
    targetBook.isComplete = false;
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

function deleteValidation(bookTitle) {
    if (confirm(`Delete ${bookTitle} ?`)) {
        return true
    } else {
        return false
    }
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index
        }
    }
    return -1
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
    const bookTitle = document.createElement('h3')
    bookTitle.innerText = book.title

    const bookAuthor = document.createElement('p')
    bookAuthor.innerText = book.author

    const bookYear = document.createElement('p')
    bookYear.innerHTML = book.year

    const container = document.createElement('article')
    container.classList.add('book_item')
    container.append(bookTitle, bookAuthor, bookYear)

    return container
}