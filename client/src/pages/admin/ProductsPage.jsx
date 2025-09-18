import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProductsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // États pour les données et le chargement
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // États pour la pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // États pour le tri et le filtrage
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    status: '',
    priceMin: '',
    priceMax: '',
    stockStatus: '',
  });
  
  // États pour les boîtes de dialogue
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // États pour les options de filtre
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  // Charger les produits
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Construire les paramètres de requête
        const params = new URLSearchParams({
          page: page + 1,
          limit: rowsPerPage,
          sort: `${sortField}:${sortOrder}`,
          search: searchTerm,
          ...filters,
        });
        
        const response = await axios.get(`/api/products/admin?${params.toString()}`);
        
        setProducts(response.data.products);
        setTotalProducts(response.data.total);
        setError('');
      } catch (err) {
        console.error('Erreur lors du chargement des produits:', err);
        setError('Erreur lors du chargement des produits');
        toast.error('Impossible de charger les produits');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [page, rowsPerPage, sortField, sortOrder, searchTerm, filters]);
  
  // Charger les catégories et marques pour les filtres
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          axios.get('/api/categories'),
          axios.get('/api/brands'),
        ]);
        
        setCategories(categoriesRes.data);
        setBrands(brandsRes.data);
      } catch (err) {
        console.error('Erreur lors du chargement des options de filtre:', err);
      }
    };
    
    fetchFilterOptions();
  }, []);
  
  // Gestion des changements de page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Gestion du changement de nombre de lignes par page
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Réinitialiser à la première page
  };
  
  // Gestion du tri
  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortField(field);
    setSortOrder(isAsc ? 'desc' : 'asc');
    setPage(0); // Réinitialiser à la première page lors du tri
  };
  
  // Gestion de la recherche
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0); // Réinitialiser à la première page lors de la recherche
  };
  
  // Réinitialiser les filtres
  const handleResetFilters = () => {
    setFilters({
      category: '',
      brand: '',
      status: '',
      priceMin: '',
      priceMax: '',
      stockStatus: '',
    });
    setSearchTerm('');
    setPage(0);
  };
  
  // Gestion de la suppression d'un produit
  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    
    try {
      await axios.delete(`/api/products/${selectedProduct._id}`);
      
      // Mettre à jour la liste des produits
      setProducts(products.filter((p) => p._id !== selectedProduct._id));
      setTotalProducts(totalProducts - 1);
      
      toast.success('Produit supprimé avec succès');
    } catch (err) {
      console.error('Erreur lors de la suppression du produit:', err);
      toast.error('Erreur lors de la suppression du produit');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
    }
  };
  
  // Colonnes pour le tableau de données
  const columns = [
    {
      field: 'image',
      headerName: 'Image',
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <Box
          component="img"
          src={params.row.images?.[0] || '/placeholder-product.jpg'}
          alt={params.row.name}
          sx={{
            width: 40,
            height: 40,
            objectFit: 'cover',
            borderRadius: 1,
          }}
        />
      ),
    },
    {
      field: 'name',
      headerName: 'Nom',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" noWrap>
            {params.row.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            SKU: {params.row.sku}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'category',
      headerName: 'Catégorie',
      width: 150,
      valueGetter: (params) => params.row.category?.name || 'Non catégorisé',
    },
    {
      field: 'price',
      headerName: 'Prix',
      width: 120,
      renderCell: (params) => (
        <Box>
          {params.row.salePrice ? (
            <>
              <Typography variant="body2" color="error" sx={{ fontWeight: 'bold' }}>
                {params.row.salePrice.toFixed(2)} €
              </Typography>
              <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                {params.row.price.toFixed(2)} €
              </Typography>
            </>
          ) : (
            <Typography variant="body2">
              {params.row.price.toFixed(2)} €
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'stock',
      headerName: 'Stock',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.row.stock > 0 ? `${params.row.stock} en stock` : 'Rupture'}
          color={params.row.stock > 0 ? 'success' : 'error'}
          size="small"
          variant={params.row.stock > 0 ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Statut',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.row.isActive ? 'Actif' : 'Inactif'}
          color={params.row.isActive ? 'success' : 'default'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Date de création',
      width: 150,
      valueFormatter: (params) =>
        format(new Date(params.value), 'dd MMM yyyy', { locale: fr }),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Voir" placement="top">
            <IconButton
              size="small"
              color="info"
              onClick={() => navigate(`/products/${params.row._id}`)}
              target="_blank"
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Modifier" placement="top">
            <IconButton
              size="small"
              color="primary"
              onClick={() => navigate(`/admin/products/edit/${params.row._id}`)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer" placement="top">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteClick(params.row)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];
  
  // Colonnes pour les écrans mobiles
  const mobileColumns = [
    {
      field: 'name',
      headerName: 'Produit',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ py: 1 }}>
          <Box
            component="img"
            src={params.row.images?.[0] || '/placeholder-product.jpg'}
            alt={params.row.name}
            sx={{
              width: 40,
              height: 40,
              objectFit: 'cover',
              borderRadius: 1,
              mr: 1,
              float: 'left',
            }}
          />
          <Box sx={{ ml: 5 }}>
            <Typography variant="body2" fontWeight="medium" noWrap>
              {params.row.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              {params.row.salePrice ? (
                <>
                  <Typography variant="body2" color="error" fontWeight="bold">
                    {params.row.salePrice.toFixed(2)} €
                  </Typography>
                  <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                    {params.row.price.toFixed(2)} €
                  </Typography>
                </>
              ) : (
                <Typography variant="body2">
                  {params.row.price.toFixed(2)} €
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Chip
                label={params.row.stock > 0 ? `${params.row.stock} en stock` : 'Rupture'}
                color={params.row.stock > 0 ? 'success' : 'error'}
                size="small"
                variant={params.row.stock > 0 ? 'filled' : 'outlined'}
              />
              <Chip
                label={params.row.isActive ? 'Actif' : 'Inactif'}
                color={params.row.isActive ? 'success' : 'default'}
                size="small"
                variant="outlined"
              />
            </Box>
          </Box>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', width: '100%' }}>
          <Tooltip title="Voir">
            <IconButton
              size="small"
              color="info"
              onClick={() => navigate(`/products/${params.row._id}`)}
              target="_blank"
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Modifier">
            <IconButton
              size="small"
              color="primary"
              onClick={() => navigate(`/admin/products/edit/${params.row._id}`)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteClick(params.row)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* En-tête de la page */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Gestion des produits
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/products/new')}
        >
          Ajouter un produit
        </Button>
      </Box>
      
      {/* Filtres et recherche */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box component="form" onSubmit={handleSearch} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher des produits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Catégorie</InputLabel>
            <Select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              label="Catégorie"
            >
              <MenuItem value="">Toutes les catégories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Marque</InputLabel>
            <Select
              value={filters.brand}
              onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
              label="Marque"
            >
              <MenuItem value="">Toutes les marques</MenuItem>
              {brands.map((brand) => (
                <MenuItem key={brand._id} value={brand._id}>
                  {brand.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              label="Statut"
            >
              <MenuItem value="">Tous les statuts</MenuItem>
              <MenuItem value="active">Actif</MenuItem>
              <MenuItem value="inactive">Inactif</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Prix min"
            type="number"
            size="small"
            sx={{ width: 120 }}
            value={filters.priceMin}
            onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
            InputProps={{
              startAdornment: <InputAdornment position="start">€</InputAdornment>,
            }}
          />
          
          <TextField
            label="Prix max"
            type="number"
            size="small"
            sx={{ width: 120 }}
            value={filters.priceMax}
            onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
            InputProps={{
              startAdornment: <InputAdornment position="start">€</InputAdornment>,
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Stock</InputLabel>
            <Select
              value={filters.stockStatus}
              onChange={(e) => setFilters({ ...filters, stockStatus: e.target.value })}
              label="Stock"
            >
              <MenuItem value="">Tous les stocks</MenuItem>
              <MenuItem value="in_stock">En stock</MenuItem>
              <MenuItem value="low_stock">Stock faible</MenuItem>
              <MenuItem value="out_of_stock">Rupture</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={handleResetFilters}
            sx={{ ml: 'auto' }}
          >
            Réinitialiser
          </Button>
        </Box>
      </Paper>
      
      {/* Tableau des produits */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {isMobile ? (
          <DataGrid
            rows={products}
            columns={mobileColumns}
            pageSize={rowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            checkboxSelection
            disableSelectionOnClick
            autoHeight
            loading={loading}
            pagination
            rowCount={totalProducts}
            page={page}
            onPageChange={(newPage) => setPage(newPage)}
            onPageSizeChange={(newPageSize) => setRowsPerPage(newPageSize)}
            disableColumnMenu
            disableColumnSelector
            disableDensitySelector
            components={{
              Toolbar: GridToolbar,
            }}
            componentsProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            sx={{
              '& .MuiDataGrid-cell': {
                borderBottom: 'none',
              },
              '& .MuiDataGrid-row': {
                borderBottom: '1px solid rgba(224, 224, 224, 1)',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              },
            }}
          />
        ) : (
          <DataGrid
            rows={products}
            columns={columns}
            pageSize={rowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            checkboxSelection
            disableSelectionOnClick
            autoHeight
            loading={loading}
            pagination
            rowCount={totalProducts}
            page={page}
            onPageChange={(newPage) => setPage(newPage)}
            onPageSizeChange={(newPageSize) => setRowsPerPage(newPageSize)}
            sortingMode="server"
            onSortModelChange={(sortModel) => {
              if (sortModel.length > 0) {
                setSortField(sortModel[0].field);
                setSortOrder(sortModel[0].sort);
              }
            }}
            components={{
              Toolbar: GridToolbar,
            }}
            componentsProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            sx={{
              '& .MuiDataGrid-cell': {
                padding: '8px 16px',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'background.paper',
                borderBottom: '1px solid rgba(224, 224, 224, 1)',
              },
              '& .MuiDataGrid-row': {
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              },
            }}
          />
        )}
        
        {!isMobile && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalProducts}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Lignes par page:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
            }
          />
        )}
      </Paper>
      
      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Supprimer le produit
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Êtes-vous sûr de vouloir supprimer le produit "{selectedProduct?.name}" ?
            Cette action est irréversible et supprimera définitivement le produit de la base de données.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Annuler
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            autoFocus
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductsPage;
