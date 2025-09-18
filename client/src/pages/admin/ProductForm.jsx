import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  Chip,
  IconButton,
  CircularProgress,
  FormControlLabel,
  Switch,
  FormGroup,
  Card,
  CardMedia,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { toast } from 'react-toastify';

// Schema de validation avec Yup
const productSchema = yup.object().shape({
  name: yup.string().required('Le nom du produit est requis'),
  description: yup.string().required('La description est requise'),
  shortDescription: yup.string().max(160, 'La description courte ne doit pas dépasser 160 caractères'),
  price: yup
    .number()
    .typeError('Le prix doit être un nombre')
    .positive('Le prix doit être supérieur à 0')
    .required('Le prix est requis'),
  salePrice: yup
    .number()
    .typeError('Le prix en promotion doit être un nombre')
    .positive('Le prix en promotion doit être supérieur à 0')
    .test(
      'lessThanPrice',
      'Le prix en promotion doit être inférieur au prix normal',
      function (value) {
        return !value || value < this.parent.price;
      }
    ),
  cost: yup
    .number()
    .typeError('Le coût doit être un nombre')
    .positive('Le coût doit être supérieur à 0'),
  sku: yup.string().required('La référence (SKU) est requise'),
  stock: yup
    .number()
    .typeError('La quantité en stock doit être un nombre')
    .integer('La quantité doit être un nombre entier')
    .min(0, 'La quantité ne peut pas être négative')
    .required('La quantité en stock est requise'),
  category: yup.string().required('La catégorie est requise'),
  subcategory: yup.string(),
  brand: yup.string().required('La marque est requise'),
  isActive: yup.boolean().default(true),
  isFeatured: yup.boolean().default(false),
  specifications: yup.array().of(
    yup.object().shape({
      name: yup.string().required('Le nom de la spécification est requis'),
      value: yup.string().required('La valeur est requise'),
    })
  ),
});

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      shortDescription: '',
      price: 0,
      salePrice: 0,
      cost: 0,
      sku: '',
      stock: 0,
      category: '',
      subcategory: '',
      brand: '',
      isActive: true,
      isFeatured: false,
      specifications: [],
    },
  });

  const selectedCategory = watch('category');

  // Charger les données initiales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Charger les catégories et marques
        const [categoriesRes, brandsRes] = await Promise.all([
          axios.get('/api/categories'),
          axios.get('/api/brands'),
        ]);
        
        setCategories(categoriesRes.data);
        setBrands(brandsRes.data);
        
        // Si c'est un formulaire d'édition, charger le produit
        if (isEditMode) {
          const productRes = await axios.get(`/api/products/${id}`);
          const product = productRes.data;
          
          // Mettre à jour les valeurs du formulaire
          const { images: productImages, ...productData } = product;
          reset({
            ...productData,
            category: product.category?._id || '',
            subcategory: product.subcategory?._id || '',
            brand: product.brand?._id || '',
          });
          
          // Mettre à jour les images
          setImages(productImages || []);
          setImagePreview(productImages || []);
          
          // Charger les sous-catégories si une catégorie est sélectionnée
          if (product.category?._id) {
            fetchSubcategories(product.category._id);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [id, isEditMode, reset]);

  // Charger les sous-catégories lorsque la catégorie change
  useEffect(() => {
    if (selectedCategory) {
      fetchSubcategories(selectedCategory);
    } else {
      setSubcategories([]);
      setValue('subcategory', '');
    }
  }, [selectedCategory, setValue]);

  const fetchSubcategories = async (categoryId) => {
    try {
      const res = await axios.get(`/api/categories/${categoryId}/subcategories`);
      setSubcategories(res.data);
    } catch (error) {
      console.error('Erreur lors du chargement des sous-catégories:', error);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + images.length > 10) {
      toast.warning('Vous ne pouvez pas télécharger plus de 10 images');
      return;
    }
    
    const newImages = [];
    const newImagePreviews = [];
    
    files.forEach((file) => {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        toast.warning(`Le fichier ${file.name} n'est pas une image valide`);
        return;
      }
      
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.warning(`L'image ${file.name} dépasse la taille maximale de 5MB`);
        return;
      }
      
      newImages.push(file);
      
      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onload = (e) => {
        newImagePreviews.push(e.target.result);
        setImagePreview([...imagePreview, ...newImagePreviews]);
      };
      reader.readAsDataURL(file);
    });
    
    setImages([...images, ...newImages]);
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    const newImagePreviews = [...imagePreview];
    
    newImages.splice(index, 1);
    newImagePreviews.splice(index, 1);
    
    setImages(newImages);
    setImagePreview(newImagePreviews);
  };

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
    setIsImageDialogOpen(true);
  };

  const handleMoveImage = (fromIndex, toIndex) => {
    const newImages = [...images];
    const newImagePreviews = [...imagePreview];
    
    // Déplacer l'image
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    
    // Déplacer l'aperçu correspondant
    const [movedPreview] = newImagePreviews.splice(fromIndex, 1);
    newImagePreviews.splice(toIndex, 0, movedPreview);
    
    setImages(newImages);
    setImagePreview(newImagePreviews);
  };

  const addSpecification = () => {
    setValue('specifications', [...watch('specifications'), { name: '', value: '' }]);
  };

  const removeSpecification = (index) => {
    const updatedSpecs = [...watch('specifications')];
    updatedSpecs.splice(index, 1);
    setValue('specifications', updatedSpecs);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      
      // Ajouter les champs du formulaire
      Object.keys(data).forEach((key) => {
        if (key === 'specifications') {
          formData.append(key, JSON.stringify(data[key]));
        } else if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });
      
      // Ajouter les images
      images.forEach((image) => {
        if (image instanceof File) {
          formData.append('images', image);
        }
      });
      
      let response;
      
      if (isEditMode) {
        // Mise à jour du produit existant
        response = await axios.put(`/api/products/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Produit mis à jour avec succès');
      } else {
        // Création d'un nouveau produit
        response = await axios.post('/api/products', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Produit créé avec succès');
      }
      
      // Rediriger vers la page du produit ou la liste des produits
      navigate(`/admin/products/${response.data._id}`);
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      toast.error(
        error.response?.data?.message || 'Une erreur est survenue lors de la sauvegarde du produit'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isEditMode) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Modifier le produit' : 'Nouveau produit'}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Retour
        </Button>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Informations principales */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Informations générales
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Nom du produit"
                        variant="outlined"
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        disabled={loading}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Controller
                    name="shortDescription"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Description courte"
                        variant="outlined"
                        multiline
                        rows={2}
                        error={!!errors.shortDescription}
                        helperText={
                          errors.shortDescription?.message ||
                          'Une description courte qui apparaîtra dans les résultats de recherche (max 160 caractères)'
                        }
                        disabled={loading}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Description détaillée"
                        variant="outlined"
                        multiline
                        rows={4}
                        error={!!errors.description}
                        helperText={errors.description?.message}
                        disabled={loading}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>
            
            {/* Images du produit */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Images du produit
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="product-images-upload"
                  type="file"
                  multiple
                  onChange={handleImageUpload}
                  disabled={loading || imagePreview.length >= 10}
                />
                <label htmlFor="product-images-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    disabled={loading || imagePreview.length >= 10}
                  >
                    Télécharger des images ({imagePreview.length}/10)
                  </Button>
                </label>
                <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                  Taille maximale : 5MB par image. Formats acceptés : JPG, PNG, WEBP
                </Typography>
              </Box>
              
              {imagePreview.length > 0 ? (
                <Grid container spacing={2}>
                  {imagePreview.map((preview, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                      <Card
                        sx={{
                          position: 'relative',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          overflow: 'hidden',
                          '&:hover .image-actions': {
                            opacity: 1,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            position: 'relative',
                            pt: '100%',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleImageClick(index)}
                        >
                          <CardMedia
                            component="img"
                            image={preview}
                            alt={`Preview ${index + 1}`}
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                          
                          <Box
                            className="image-actions"
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: 'rgba(0, 0, 0, 0.5)',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              padding: 1,
                              opacity: 0,
                              transition: 'opacity 0.2s',
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveImage(index);
                                }}
                                sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                              {index > 0 && (
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveImage(index, index - 1);
                                  }}
                                  sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                                >
                                  <ArrowBackIcon fontSize="small" />
                                </IconButton>
                              )}
                              
                              {index < imagePreview.length - 1 && (
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveImage(index, index + 1);
                                  }}
                                  sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                                >
                                  <ArrowBackIcon fontSize="small" sx={{ transform: 'rotate(180deg)' }} />
                                </IconButton>
                              )}
                            </Box>
                          </Box>
                        </Box>
                        
                        {index === 0 && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 8,
                              left: 8,
                              backgroundColor: 'primary.main',
                              color: 'primary.contrastText',
                              px: 1,
                              borderRadius: 0.5,
                              fontSize: '0.7rem',
                              fontWeight: 'bold',
                            }}
                          >
                            Principale
                          </Box>
                        )}
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box
                  sx={{
                    border: '2px dashed',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 4,
                    textAlign: 'center',
                    backgroundColor: 'action.hover',
                  }}
                >
                  <ImageIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Aucune image téléchargée. Glissez-déposez des images ou cliquez pour sélectionner.
                  </Typography>
                </Box>
              )}
            </Paper>
            
            {/* Spécifications */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Spécifications techniques</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={addSpecification}
                  disabled={loading}
                >
                  Ajouter
                </Button>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              {watch('specifications')?.map((spec, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={5}>
                      <Controller
                        name={`specifications.${index}.name`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Nom"
                            variant="outlined"
                            size="small"
                            error={!!errors.specifications?.[index]?.name}
                            helperText={errors.specifications?.[index]?.name?.message}
                            disabled={loading}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={5}>
                      <Controller
                        name={`specifications.${index}.value`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Valeur"
                            variant="outlined"
                            size="small"
                            error={!!errors.specifications?.[index]?.value}
                            helperText={errors.specifications?.[index]?.value?.message}
                            disabled={loading}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <IconButton
                        color="error"
                        onClick={() => removeSpecification(index)}
                        disabled={loading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
              
              {(!watch('specifications') || watch('specifications').length === 0) && (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Aucune spécification technique ajoutée.
                </Typography>
              )}
            </Paper>
          </Grid>
          
          {/* Informations secondaires */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3, position: 'sticky', top: 20 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Publication</Typography>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          color="primary"
                        />
                      }
                      label={field.value ? 'Publié' : 'Brouillon'}
                      labelPlacement="start"
                      disabled={loading}
                    />
                  )}
                />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Controller
                  name="isFeatured"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="En vedette"
                      labelPlacement="start"
                      disabled={loading}
                    />
                  )}
                />
                
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  disabled={loading}
                >
                  {isEditMode ? 'Mettre à jour' : 'Créer le produit'}
                </Button>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Prix et stock
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={12}>
                  <Controller
                    name="price"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Prix de vente"
                        type="number"
                        variant="outlined"
                        size="small"
                        InputProps={{
                          startAdornment: '€',
                          inputProps: { min: 0, step: 0.01 },
                        }}
                        error={!!errors.price}
                        helperText={errors.price?.message}
                        disabled={loading}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={12}>
                  <Controller
                    name="salePrice"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Prix promotionnel"
                        type="number"
                        variant="outlined"
                        size="small"
                        InputProps={{
                          startAdornment: '€',
                          inputProps: { min: 0, step: 0.01 },
                        }}
                        error={!!errors.salePrice}
                        helperText={
                          errors.salePrice?.message ||
                          'Laissez vide si pas de promotion'
                        }
                        disabled={loading}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={12}>
                  <Controller
                    name="cost"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Coût du produit"
                        type="number"
                        variant="outlined"
                        size="small"
                        InputProps={{
                          startAdornment: '€',
                          inputProps: { min: 0, step: 0.01 },
                        }}
                        error={!!errors.cost}
                        helperText={errors.cost?.message}
                        disabled={loading}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={12}>
                  <Controller
                    name="stock"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Quantité en stock"
                        type="number"
                        variant="outlined"
                        size="small"
                        inputProps={{ min: 0 }}
                        error={!!errors.stock}
                        helperText={errors.stock?.message}
                        disabled={loading}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Controller
                    name="sku"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Référence (SKU)"
                        variant="outlined"
                        size="small"
                        error={!!errors.sku}
                        helperText={errors.sku?.message}
                        disabled={loading}
                      />
                    )}
                  />
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Organisation
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth size="small" error={!!errors.category}>
                        <InputLabel>Catégorie</InputLabel>
                        <Select
                          {...field}
                          label="Catégorie"
                          disabled={loading || categories.length === 0}
                        >
                          {categories.map((category) => (
                            <MenuItem key={category._id} value={category._id}>
                              {category.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.category && (
                          <FormHelperText>{errors.category.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Controller
                    name="subcategory"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth size="small" error={!!errors.subcategory}>
                        <InputLabel>Sous-catégorie</InputLabel>
                        <Select
                          {...field}
                          label="Sous-catégorie"
                          disabled={loading || subcategories.length === 0}
                        >
                          <MenuItem value="">
                            <em>Aucune</em>
                          </MenuItem>
                          {subcategories.map((subcategory) => (
                            <MenuItem key={subcategory._id} value={subcategory._id}>
                              {subcategory.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.subcategory && (
                          <FormHelperText>{errors.subcategory.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Controller
                    name="brand"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth size="small" error={!!errors.brand}>
                        <InputLabel>Marque</InputLabel>
                        <Select
                          {...field}
                          label="Marque"
                          disabled={loading || brands.length === 0}
                        >
                          {brands.map((brand) => (
                            <MenuItem key={brand._id} value={brand._id}>
                              {brand.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.brand && (
                          <FormHelperText>{errors.brand.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>
            
            {isEditMode && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Actions
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  fullWidth
                  disabled={loading}
                  onClick={() => {
                    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')) {
                      // TODO: Implémenter la suppression du produit
                      console.log('Suppression du produit', id);
                    }
                  }}
                >
                  Supprimer le produit
                </Button>
                
                <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
                  Créé le: {new Date().toLocaleDateString()}
                  <br />
                  Dernière modification: {new Date().toLocaleDateString()}
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </form>
      
      {/* Dialogue d'aperçu d'image */}
      <Dialog
        open={isImageDialogOpen}
        onClose={() => setIsImageDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Aperçu de l'image</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <img
              src={imagePreview[selectedImageIndex]}
              alt={`Preview ${selectedImageIndex + 1}`}
              style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsImageDialogOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductForm;
