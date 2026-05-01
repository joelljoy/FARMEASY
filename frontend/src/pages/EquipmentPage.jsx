import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Spinner, InputGroup, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useGeolocation } from '../hooks/useGeolocation';
import { equipment as equipmentApi } from '../services/api';
import { parseListResponse } from '../utils/apiHelpers';

const DEFAULT_RADIUS_KM = 100;
const DEMO_EQUIPMENT = [
  {
    id: 1,
    title: 'Tractor (Demo)',
    location: 'Demo Village',
    pricePerDay: 1500,
    imageUrl: 'https://via.placeholder.com/400x200?text=Tractor',
  },
  {
    id: 2,
    title: 'Rotavator (Demo)',
    location: 'Demo Village',
    pricePerDay: 800,
    imageUrl: 'https://via.placeholder.com/400x200?text=Rotavator',
  },
];
const isDev = import.meta.env.DEV;

export default function EquipmentPage() {
  const { t } = useTranslation();
  const { lat, lon } = useGeolocation();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [radiusKm, setRadiusKm] = useState('');
  const [fetchError, setFetchError] = useState(null);

  const hasLocation = typeof lat === 'number' && typeof lon === 'number' && !Number.isNaN(lat) && !Number.isNaN(lon);
  const radiusValue = radiusKm.trim() === '' ? null : parseFloat(radiusKm);
  const effectiveRadius = hasLocation
    ? (radiusValue != null && !Number.isNaN(radiusValue) && radiusValue > 0 ? radiusValue : DEFAULT_RADIUS_KM)
    : null;

  useEffect(() => {
    setLoading(true);
    setFetchError(null);

    const params = {
      category: category.trim() || undefined,
    };

    if (hasLocation) {
      params.lat = lat;
      params.lon = lon;
      params.radiusKm = effectiveRadius;
    }

    if (isDev) {
      console.log('Equipment fetch — Lat:', lat, 'Lng:', lon, 'Radius:', effectiveRadius, 'Params:', params);
    }

    equipmentApi
      .listPublic(params)
      .then((res) => {
        if (isDev) console.log('Equipment API response:', res.data);
        const items = parseListResponse(res);
        setList(items);
        setFetchError(null);
      })
      .catch((err) => {
        console.error('Equipment API error:', err?.response?.data ?? err.message);
        // Fallback to demo data so the page works at testing level
        setList(DEMO_EQUIPMENT);
        setFetchError(err?.response?.data?.message ?? err.message ?? 'Failed to load equipment, showing demo data');
      })
      .finally(() => setLoading(false));
  }, [lat, lon, hasLocation, category, effectiveRadius]);

  const showAllListingsMessage = !hasLocation;

  return (
    <Container className="py-5 page-container">
      <h2 className="section-title mb-4">{t('equipment.title')}</h2>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Control
            placeholder={t('equipment.categoryFilter')}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </Col>
        <Col md={4}>
          <InputGroup>
            <Form.Control
              type="number"
              min="0"
              step="1"
              placeholder={t('equipment.radiusKm')}
              value={radiusKm}
              onChange={(e) => setRadiusKm(e.target.value)}
            />
            <InputGroup.Text>km</InputGroup.Text>
          </InputGroup>
          {hasLocation && (
            <Form.Text className="text-muted">
              {t('equipment.radiusKm')} (default {DEFAULT_RADIUS_KM} km)
            </Form.Text>
          )}
        </Col>
        <Col md={4}>
          {hasLocation && <span className="text-success">{t('equipment.nearby')}</span>}
        </Col>
      </Row>

      {showAllListingsMessage && (
        <Alert variant="info" className="mb-3 small">
          {t('equipment.showingAllListings')}
        </Alert>
      )}

      {fetchError && (
        <Alert variant="warning" className="mb-3">
          {fetchError}
        </Alert>
      )}

      {loading ? (
        <div className="loading-spinner">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {list.map((item) => (
            <Col key={item.id}>
              <Card className={`h-100 card-modern border-0 ${item.availability === 'Rented' ? 'rented-item' : ''}`}>
                {item.imageUrl && (
                  <Card.Img variant="top" src={item.imageUrl} style={{ height: 160, objectFit: 'cover' }} alt="" />
                )}
                {item.availability === 'Rented' && (
                  <div className="rented-overlay">Rented</div>
                )}
                <Card.Body>
                  <Card.Title>{item.title}</Card.Title>
                  <Card.Text className="small text-muted">{item.location}</Card.Text>
                  <Card.Text>₹{item.pricePerDay}/day</Card.Text>
                  {item.distanceKm != null && (
                    <Card.Text className="small">{item.distanceKm.toFixed(1)} km away</Card.Text>
                  )}
                  {item.availability === 'Rented' ? (
                    <button className="btn btn-secondary btn-sm" disabled>
                      {t('equipment.rented', 'Rented')}
                    </button>
                  ) : (
                    <Link to={`/equipment/${item.id}`} className="btn btn-primary btn-sm">
                      {t('equipment.viewAndContact')}
                    </Link>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
          {list.length === 0 && (
            <Col>
              <p className="text-muted">{t('equipment.noListed')}</p>
            </Col>
          )}
        </Row>
      )}
    </Container>
  );
}
