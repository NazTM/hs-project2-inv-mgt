'use client'

import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, TextField } from '@mui/material'
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [filteredInventory, setFilteredInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [editItem, setEditItem] = useState(null)
  const [editQuantity, setEditQuantity] = useState('')

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
    setFilteredInventory(inventoryList)
  }

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1 })
    } else {
      await setDoc(docRef, { quantity: 1 })
    }
    await updateInventory()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }
    await updateInventory()
  }

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)
    if (query === '') {
      setFilteredInventory(inventory)
    } else {
      const filtered = inventory.filter(({ name }) => 
        name.toLowerCase().includes(query)
      )
      setFilteredInventory(filtered)
    }
  }

  const handleQuantityChange = (name, value) => {
    setEditQuantity(value)
    // Update quantity in Firebase
    if (!isNaN(value) && value >= 0) {
      const docRef = doc(collection(firestore, 'inventory'), name)
      setDoc(docRef, { quantity: parseInt(value) })
        .then(() => updateInventory())
    }
  }

  useEffect(() => {
    updateInventory()
  }, [])

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
    >
      <Button variant="contained" onClick={handleOpen}>
        Add New Item
      </Button>

      {/* Search Bar */}
      <Box width="800px" marginBottom={2}>
        <TextField
          fullWidth
          label="Search Inventory"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearch}
        />
      </Box>

      <Box border={'1px solid #333'}>
        <Box
          width="800px"
          height="100px"
          bgcolor={'#ADD8E6'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
            Inventory Items
          </Typography>
        </Box>
        <Stack
          width="800px"
          height="300px"
          spacing={2}
          sx={{ overflowY: 'auto' }}
        >
          {filteredInventory.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              minHeight="150px"
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              bgcolor={'#f0f0f0'}
              paddingX={5}
              boxSizing="border-box"
              sx={{
                wordBreak: 'break-word',
              }}
            >
              <Typography
                variant={'h5'}
                color={'#333'}
                sx={{ flex: 1, maxWidth: '50%' }}
              >
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <TextField
                value={quantity}
                onChange={(e) => handleQuantityChange(name, e.target.value)}
                type="number"
                variant="outlined"
                size="small"
                sx={{ flexBasis: '120px', textAlign: 'left' }}
              />
              <Stack
                direction="row"
                spacing={2}
                justifyContent="center"
                sx={{ flexBasis: '30%', flexGrow: 0, flexShrink: 0 }}
              >
                <Button
                  variant="contained"
                  onClick={() => removeItem(name)}
                >
                  Remove Item
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}
