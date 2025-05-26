import React, { useState } from 'react';
import { 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions, 
  Typography, 
  Button, 
  Rating, 
  Box,
  IconButton,
  Chip,
  Tooltip,
  Skeleton,
  alpha,
  useTheme
} from '@mui/material';
import { 
  ShoppingCart as CartIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

const ProductItem = ({ product, elevation = 1 }) => {
  const theme = useTheme();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [loading, setLoading] = useState(false);
  const [inWishlist, setInWishlist] = useState(isInWishlist(product._id));

  // Format price properly
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    setLoading(true);
    try {
      await addToCart(product._id, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    setLoading(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(product._id);
        setInWishlist(false);
      } else {
        await addToWishlist(product._id);
        setInWishlist(true);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get the pet type label
  const getPetTypeLabel = (petType) => {
    const petTypes = {
      DOG: 'Dogs',
      CAT: 'Cats',
      BIRD: 'Birds',
      SMALL_ANIMAL: 'Small Animals',
      FISH: 'Fish',
      REPTILE: 'Reptiles',
      ALL: 'All Pets'
    };
    
    if (Array.isArray(petType)) {
      return petType.map(type => petTypes[type] || type).join(', ');
    }
    
    return petTypes[petType] || petType;
  };

  // Get category label
  const getCategoryLabel = (category) => {
    const categories = {
      FOOD: 'Food',
      TOYS: 'Toys',
      BEDS: 'Beds',
      GROOMING: 'Grooming',
      HEALTH: 'Health',
      ACCESSORIES: 'Accessories'
    };
    
    return categories[category] || category;
  };

  if (!product) {
    return (
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'transform 0.3s',
          '&:hover': { transform: 'translateY(-4px)' }
        }}
        elevation={elevation}
      >
        <Skeleton variant="rectangular" height={200} />
        <CardContent>
          <Skeleton variant="text" height={28} width="80%" />
          <Skeleton variant="text" height={20} width="40%" />
          <Skeleton variant="text" height={24} width="60%" />
        </CardContent>
        <CardActions>
          <Skeleton variant="rectangular" height={36} width="100%" />
        </CardActions>
      </Card>
    );
  }

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.3s',
        position: 'relative',
        '&:hover': { 
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
        }
      }}
      elevation={elevation}
    >
      {/* Discount badge */}
      {product.salePrice && product.salePrice < product.price && (
        <Chip
          label={`${Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF`}
          color="error"
          size="small"
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            fontWeight: 'bold',
            zIndex: 1
          }}
        />
      )}

      {/* Wishlist button */}
      <IconButton
        onClick={handleWishlistToggle}
        disabled={loading}
        sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          zIndex: 1,
          '&:hover': {
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
          }
        }}
      >
        {inWishlist ? (
          <FavoriteIcon color="error" />
        ) : (
          <FavoriteBorderIcon />
        )}
      </IconButton>

      {/* Product image */}
      <CardMedia
        component={RouterLink}
        to={`/store/product/${product._id}`}
        sx={{ 
          height: 200, 
          backgroundSize: 'contain', 
          backgroundPosition: 'center',
          transition: 'opacity 0.3s',
          '&:hover': { opacity: 0.9 }
        }}
        image={product.images && product.images.length > 0 
          ? product.images[0]
          : '/placeholder-product.png'
        }
        title={product.name}
      />

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Product category and pet type */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mb: 1,
            flexWrap: 'wrap'
          }}
        >
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ 
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              px: 1,
              py: 0.5,
              borderRadius: 1,
              display: 'inline-block'
            }}
          >
            {getCategoryLabel(product.category)}
          </Typography>
          
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ 
              backgroundColor: alpha(theme.palette.secondary.main, 0.1),
              px: 1,
              py: 0.5,
              borderRadius: 1,
              display: 'inline-block'
            }}
          >
            {getPetTypeLabel(product.petType)}
          </Typography>
        </Box>

        {/* Product name */}
        <Typography 
          variant="h6" 
          component={RouterLink}
          to={`/store/product/${product._id}`}
          sx={{ 
            mb: 1, 
            fontWeight: 'bold',
            color: 'text.primary',
            textDecoration: 'none',
            '&:hover': {
              color: theme.palette.primary.main
            },
            // Limit to 2 lines
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            height: 48
          }}
        >
          {product.name}
        </Typography>

        {/* Rating */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Rating 
            value={product.rating || 0} 
            precision={0.5} 
            readOnly 
            size="small" 
          />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({product.reviews?.length || 0})
          </Typography>
        </Box>

        {/* Price */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {product.salePrice ? (
            <>
              <Typography 
                variant="h6" 
                color="primary" 
                sx={{ fontWeight: 'bold' }}
              >
                {formatPrice(product.salePrice)}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  ml: 1, 
                  textDecoration: 'line-through' 
                }}
              >
                {formatPrice(product.price)}
              </Typography>
            </>
          ) : (
            <Typography 
              variant="h6" 
              color="primary" 
              sx={{ fontWeight: 'bold' }}
            >
              {formatPrice(product.price)}
            </Typography>
          )}
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          startIcon={<CartIcon />}
          onClick={handleAddToCart}
          disabled={loading || !product.inventory || product.inventory <= 0}
          sx={{ mr: 1 }}
        >
          {product.inventory > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>

        <Tooltip title="View Details">
          <IconButton 
            component={RouterLink} 
            to={`/store/product/${product._id}`}
            color="primary"
            sx={{ 
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
              }
            }}
          >
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default ProductItem; 