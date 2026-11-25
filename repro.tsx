import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import Full from './src/containers/Full/Full'
import { useStore } from './src/store'
import './scss/style.scss'
window.serverRoutesPrefix = '/skServer'
useStore.getState().setVesselInfo({ name: 'Test Vessel' })
useStore.getState().setWebapps([{ name: 'test-logbook', signalk: { displayName: 'Logbook' } }])
createRoot(document.getElementById('root')!).render(<HashRouter><Full /></HashRouter>)
