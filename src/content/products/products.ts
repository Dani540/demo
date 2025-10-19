// Imports
import imgTetera from '@/assets/te_tetera.jpg';
import imgDobleAzucarTe from '@/assets/doble_azucar_te.jpg';
import imgDobleAzucarYerba from '@/assets/doble_azucar_yerba.jpg';
import imgTeRejilla from '@/assets/te_rejilla.jpg';
import imgServilletero from '@/assets/servilletero.jpg';
import imgPortaCubiertos from '@/assets/porta_cubiertos.jpg';

// Exports
export default [
  {
    "id": "prod-001",
    "name": "Té Tetera",
    "description": "Porta té en forma de tetera de madera.",
    "price": 1000,
    "minQuantity": 20,
    "image": imgTetera, // Pasamos el objeto de imagen importado
    "galleryImages": [imgTetera.src] // Pasamos el string de la ruta ya procesada
  },
  {
    "id": "prod-002",
    "name": "Azúcar y Té Doble",
    "description": "Azucarero y Té de madera.",
    "price": 1500,
    "minQuantity": 10,
    "image": imgDobleAzucarTe,
    "galleryImages": [imgDobleAzucarTe.src]
  },
  {
    "id": "prod-003",
    "name": "Azucarero y yerbero",
    "description": "Azucarero y yerbero de madera.",
    "price": 1000,
    "minQuantity": 20,
    "image": imgDobleAzucarYerba,
    "galleryImages": [imgDobleAzucarYerba.src]
  },
  {
    "id": "prod-004",
    "name": "Té Rejilla",
    "description": "Té rejilla.",
    "price": 300,
    "minQuantity": 30,
    "image": imgTeRejilla,
    "galleryImages": [imgTeRejilla.src]
  },
  {
    "id": "prod-005",
    "name": "Té Tetera", // Producto prod-005
    "description": "Té simple con forma de tetera de madera.",
    "price": 300,
    "minQuantity": 30,
    "image": imgTetera, // Re-usamos la imagen
    "galleryImages": [imgTetera.src]
  },
  {
    "id": "prod-006",
    "name": "Servilletero",
    "description": "Servilletero de madera.",
    "price": 300,
    "minQuantity": 30,
    "image": imgServilletero,
    "galleryImages": [imgServilletero.src]
  },
  {
    "id": "prod-007",
    "name": "Porta cubiertos",
    "description": "Portador de cubiertos de madera.",
    "price": 1300,
    "minQuantity": 30,
    "image": imgPortaCubiertos,
    "galleryImages": [imgPortaCubiertos.src]
  }
]