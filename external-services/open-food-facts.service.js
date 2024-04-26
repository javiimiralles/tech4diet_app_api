const { Router, response } = require('express');
const axios = require('axios');

const router = Router();

const fields = 'product_name,brands,nutriments';

// Obtener producto por codigo de barras
router.get('/product/:barcode', async(req, res = response) => {

    try {
        const barcode = req.params.barcode;
        const url = `${process.env.OPENFOODFACTS_BASE_URL}/api/v0/product/${barcode}.json?fields=${fields}`;
        const response = await axios.get(url);
        const foodData = response.data.product;

        if(response.data.status_verbose === 'product not found') {
            return res.status(404).json({
                ok: false,
                msg: 'Producto no encontrado'
            });
        }

        res.json({
            ok: true,
            foodData
        })

    } catch (error) {
        console.error('Error al buscar el alimento:', error);
        return res.json({
            ok: false,
            msg: 'Error al buscar el alimento'
        })
    }
});

// Busca alimentos mediante una cadena de búsqueda
router.get('/search', async(req, res = response) => {

    try {
        const query = req.query.query || '';
        const pageSize = req.query.resultados || 10;
        const url = `${process.env.OPENFOODFACTS_BASE_URL}/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1&page_size=${pageSize}&fields=${fields}`;
        const response = await axios.get(url);

        const searchResults = response.data.products;

        if (!searchResults || searchResults.length === 0) {
            return res.status(404).json({
                ok: false,
                msg: 'No se encontraron alimentos que coincidan con la búsqueda',
            });
        }

        res.json({
            ok: true,
            searchResults,
        });

    } catch (error) {
        console.error('Error al buscar alimentos:', error);
        return res.json({
            ok: false,
            msg: 'Error al buscar alimentos',
        });
    }
});

module.exports = router;