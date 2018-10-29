'use strict'
const {useState} = require('react')





function createStorageMethods(storage, key) {
  return {

    set: (value) => {
      const stringified = JSON.stringify(value)
      storage.setItem(key, stringified)
    },
    
    get: () => {
      const stringified = storage.getItem(key)
      return JSON.parse(stringified)
    },

  }
}

function createLocalStorageMethods(key) {
  return createStorageMethods(window.localStorage, key)
}

function createSessionStorageMethods(key) {
  return createStorageMethods(window.sessionStorage, key)
}

function createCookieMethods(key, {days}) {
  return {

    set: (value) => {
      const stringified = JSON.stringify(value)
      let expiration = null
      if (days) {
        const currentDate = new Date()
        const expirationTime = currentDate.getTime() + (days * 24 * 60 * 60 * 1000)
        const expirationString = new Date(expirationTime).toUTCString()
        expiration = `; expires=${ expirationString }`
      } else {
        expiration = ''
      }
      document.cookie = `${ key }=${ stringified }${ expiration }; path=/`
    },

    get: () => {
      const cookies = document.cookie ? document.cookie.split('; ') : []
      for (let i = 0; i < cookies.length; i++) {
        const parts = cookies[i].split('=')
        if (parts[0] === key) {
          return JSON.parse(parts[1])
        }
      }
    },

  }
}





function useStateAndPersistence(createMethods, initial, key, options) {
  const {get, set} = createMethods(key, options)

  const [value, setValue] = useState((() => {
    const persistedValue = get()
    return persistedValue
      ? JSON.parse(persistedValue)
      : initial
  })())

  return [
    value,
    (updater, callback) => {
      const nextValue = typeof updater === 'function'
        ? updater(value)
        : value
      set(nextValue)
      setValue(nextValue, callback)
    },
  ]
}





function useStateAndLocalStorage(initial, key) {
  return useStateAndPersistence(createLocalStorageMethods, initial, key)
}

function useStateAndSessionStorage(initial, key) {
  return useStateAndPersistence(createSessionStorageMethods, initial, key)
}


function useStateAndCookie(initial, key, options) {
  return useStateAndPersistence(createCookieMethods, initial, key, options)
}





module.exports = {
  useStateAndLocalStorage,
  useStateAndSessionStorage,
  useStateAndCookie,
}