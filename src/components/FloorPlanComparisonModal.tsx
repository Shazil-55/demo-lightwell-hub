import { useState, useEffect } from 'react';
import { FloorPlanResponse } from '../types/api';
import { ProjectConfig } from '../types';
import { CompareOthersModal } from './CompareOthersModal';

interface FloorPlanComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  favoritedFloorPlans: FloorPlanResponse[];
  config: ProjectConfig;
  getProjectName: (projectId: string | null | undefined) => string | null;
}

export const FloorPlanComparisonModal = ({
  isOpen,
  onClose,
  favoritedFloorPlans,
  getProjectName,
}: FloorPlanComparisonModalProps) => {
  const [leftFloorPlan, setLeftFloorPlan] = useState<FloorPlanResponse | null>(null);
  const [rightFloorPlan, setRightFloorPlan] = useState<FloorPlanResponse | null>(null);
  const [isCompareOthersOpen, setIsCompareOthersOpen] = useState(false);
  const [compareOthersSide, setCompareOthersSide] = useState<'left' | 'right'>('left');
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [leftZoom, setLeftZoom] = useState(1);
  const [rightZoom, setRightZoom] = useState(1);

  // Initialize with first two favorites
  useEffect(() => {
    if (isOpen && favoritedFloorPlans.length >= 2) {
      setLeftFloorPlan(favoritedFloorPlans[0]);
      setRightFloorPlan(favoritedFloorPlans[1]);
      setLeftZoom(1);
      setRightZoom(1);
    }
  }, [isOpen, favoritedFloorPlans]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsCompareOthersOpen(false);
      setIsZoomModalOpen(false);
      setLeftZoom(1);
      setRightZoom(1);
    }
  }, [isOpen]);

  if (!isOpen || favoritedFloorPlans.length < 2) return null;

  const getRenderingsImage = (floorPlan: FloorPlanResponse | null) => {
    if (!floorPlan?.renderings || !Array.isArray(floorPlan.renderings) || floorPlan.renderings.length === 0) {
      return null;
    }
    const firstRendering = floorPlan.renderings[0];
    if (firstRendering?.images && Array.isArray(firstRendering.images) && firstRendering.images.length > 0) {
      return firstRendering.images[0]?.link || null;
    }
    return firstRendering?.link || null;
  };

  const getFloorPlanImage = (floorPlan: FloorPlanResponse | null) => {
    if (!floorPlan) return null;
    return (
      floorPlan.floorPlanPhoto?.[0]?.link ||
      floorPlan.keyPlan?.[0]?.link ||
      getRenderingsImage(floorPlan) ||
      null
    );
  };



  const handleOpenCompareOthers = (side: 'left' | 'right') => {
    setCompareOthersSide(side);
    setIsCompareOthersOpen(true);
  };

  const handleReplaceFloorPlan = (floorPlan: FloorPlanResponse) => {
    if (compareOthersSide === 'left') {
      setLeftFloorPlan(floorPlan);
      setLeftZoom(1);
    } else {
      setRightFloorPlan(floorPlan);
      setRightZoom(1);
    }
    setIsCompareOthersOpen(false);
  };

  const handleOpenZoomModal = () => {
    setIsZoomModalOpen(true);
  };

  const handleCloseZoomModal = () => {
    setIsZoomModalOpen(false);
  };

  const handleZoomIn = () => {
    setLeftZoom((prev) => Math.min(prev + 0.25, 3));
    setRightZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setLeftZoom((prev) => Math.max(prev - 0.25, 0.5));
    setRightZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setLeftZoom(1);
    setRightZoom(1);
  };

  const handleNavigate = (side: 'left' | 'right', direction: 'prev' | 'next') => {
    if (!leftFloorPlan || !rightFloorPlan) return;
    
    const currentIndex = favoritedFloorPlans.findIndex(
      (fp) => fp.id === (side === 'left' ? leftFloorPlan.id : rightFloorPlan.id)
    );
    
    if (currentIndex === -1) return;
    
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex < 0) newIndex = favoritedFloorPlans.length - 1;
    if (newIndex >= favoritedFloorPlans.length) newIndex = 0;
    
    const newFloorPlan = favoritedFloorPlans[newIndex];
    
    // Don't allow selecting the same floor plan that's on the other side
    if (side === 'left' && newFloorPlan.id === rightFloorPlan.id) {
      newIndex = direction === 'next' ? newIndex + 1 : newIndex - 1;
      if (newIndex < 0) newIndex = favoritedFloorPlans.length - 1;
      if (newIndex >= favoritedFloorPlans.length) newIndex = 0;
    } else if (side === 'right' && newFloorPlan.id === leftFloorPlan.id) {
      newIndex = direction === 'next' ? newIndex + 1 : newIndex - 1;
      if (newIndex < 0) newIndex = favoritedFloorPlans.length - 1;
      if (newIndex >= favoritedFloorPlans.length) newIndex = 0;
    }
    
    if (side === 'left') {
      setLeftFloorPlan(favoritedFloorPlans[newIndex]);
      setLeftZoom(1);
    } else {
      setRightFloorPlan(favoritedFloorPlans[newIndex]);
      setRightZoom(1);
    }
  };


  const getFloorPlanNumber = (floorPlan: FloorPlanResponse | null) => {
    if (!floorPlan) return '';
    const index = favoritedFloorPlans.findIndex((fp) => fp.id === floorPlan.id);
    return index !== -1 ? (index + 1).toString() : '';
  };

  const renderFloorPlanSection = (
    floorPlan: FloorPlanResponse | null,
    side: 'left' | 'right',
    zoom: number
  ) => {
    if (!floorPlan) return null;

    const projectName = getProjectName(floorPlan.projectId);
    const imageUrl = getFloorPlanImage(floorPlan);
    const floorPlanNumber = getFloorPlanNumber(floorPlan);
    const displayName = projectName ? `${projectName}, ${floorPlan.name}` : floorPlan.name;

    return (
      <div className="proxima-hub-compare-section">
        <div className="proxima-hub-compare-header">
          <div className="proxima-hub-compare-title">
            {floorPlanNumber && `${floorPlanNumber} | `}
            {displayName}
          </div>
          <div className="proxima-hub-compare-nav">
            <button
              className="proxima-hub-compare-nav-btn"
              onClick={() => handleNavigate(side, 'prev')}
              aria-label="Previous floor plan"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button
              className="proxima-hub-compare-nav-btn"
              onClick={() => handleNavigate(side, 'next')}
              aria-label="Next floor plan"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>

        <div className="proxima-hub-compare-details-wrapper">
          <div className="proxima-hub-compare-details">
            <div className="proxima-hub-compare-details-row">
              {floorPlan.totalSize && (
                <div className="proxima-hub-compare-detail-item">
                  <span className="proxima-hub-compare-detail-label">Total Space:</span>
                  <span className="proxima-hub-compare-detail-value">{floorPlan.totalSize}</span>
                </div>
              )}
              {floorPlan.interiorSize && (
                <div className="proxima-hub-compare-detail-item">
                  <span className="proxima-hub-compare-detail-label">Interior:</span>
                  <span className="proxima-hub-compare-detail-value">{floorPlan.interiorSize}</span>
                </div>
              )}
              {floorPlan.exteriorSize && (
                <div className="proxima-hub-compare-detail-item">
                  <span className="proxima-hub-compare-detail-label">Exterior:</span>
                  <span className="proxima-hub-compare-detail-value">{floorPlan.exteriorSize}</span>
                </div>
              )}
              {floorPlan.bedRooms && (
                <div className="proxima-hub-compare-detail-item">
                  <span className="proxima-hub-compare-detail-label">Bedroom:</span>
                  <span className="proxima-hub-compare-detail-value">
                    {floorPlan.bedRooms} Bed{floorPlan.bedRooms !== '1' ? 's' : ''}
                    {floorPlan.juniorBedRooms ? ' + 1 Den' : ''}
                    {floorPlan.flex ? ' + Flex' : ''}
                  </span>
                </div>
              )}
            </div>
            <div className="proxima-hub-compare-details-row">
              {floorPlan.bathRooms && (
                <div className="proxima-hub-compare-detail-item">
                  <span className="proxima-hub-compare-detail-label">Bath:</span>
                  <span className="proxima-hub-compare-detail-value">
                    {floorPlan.bathRooms} Bath{floorPlan.bathRooms !== '1' ? 's' : ''}, 1 Powder
                  </span>
                </div>
              )}
            </div>
          </div>
          
        </div>

        <div className="proxima-hub-compare-image-container">
          {imageUrl ? (
            <div className="proxima-hub-compare-image-wrapper">
              <img
                src={imageUrl}
                alt={floorPlan.name || 'Floor plan'}
                className="proxima-hub-compare-image"
                style={{ transform: `scale(${zoom})` }}
              />
            </div>
          ) : (
            <div className="proxima-hub-compare-image-placeholder">
              No floor plan image available
            </div>
          )}
        </div>

      </div>
    );
  };

  return (
    <>
      <div 
        className={`proxima-hub-modal-overlay proxima-hub-compare-overlay ${isOpen ? 'proxima-hub-compare-overlay-open' : ''}`}
        onClick={onClose}
      >
        <div
          className={`proxima-hub-modal-content proxima-hub-compare-content ${isOpen ? 'proxima-hub-compare-content-open' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="proxima-hub-compare-header-main">
            <h2 className="proxima-hub-compare-title-main">Compare</h2>
            <button
              className="proxima-hub-modal-close-btn"
              onClick={onClose}
              aria-label="Close"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="proxima-hub-compare-body">
            {renderFloorPlanSection(leftFloorPlan, 'left', leftZoom)}
            {renderFloorPlanSection(rightFloorPlan, 'right', rightZoom)}
          </div>

          <div className="proxima-hub-compare-footer">
            <button
              className="proxima-hub-compare-others-btn-footer"
              onClick={() => handleOpenCompareOthers('left')}
            >
              Compare Others
            </button>
            <button
              className="proxima-hub-compare-zoom-icon"
              onClick={handleOpenZoomModal}
              aria-label="Zoom images"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
            <button
              className="proxima-hub-compare-others-btn-footer"
              onClick={() => handleOpenCompareOthers('right')}
            >
              Compare Others
            </button>
          </div>
        </div>
      </div>

      {isCompareOthersOpen && (
        <CompareOthersModal
          isOpen={isCompareOthersOpen}
          onClose={() => setIsCompareOthersOpen(false)}
          favoritedFloorPlans={favoritedFloorPlans}
          currentLeftId={leftFloorPlan?.id || null}
          currentRightId={rightFloorPlan?.id || null}
          replaceSide={compareOthersSide}
          onSelect={handleReplaceFloorPlan}
          getProjectName={getProjectName}
        />
      )}

      {isZoomModalOpen && (
        <div className="proxima-hub-modal-overlay proxima-hub-zoom-modal-overlay" onClick={handleCloseZoomModal}>
          <div
            className="proxima-hub-modal-content proxima-hub-zoom-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="proxima-hub-zoom-modal-controls-only">
              <button
                className="proxima-hub-compare-zoom-btn"
                onClick={handleZoomOut}
                aria-label="Zoom out"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
              <button
                className="proxima-hub-compare-zoom-btn"
                onClick={handleResetZoom}
                aria-label="Reset zoom"
              >
                {Math.round(leftZoom * 100)}%
              </button>
              <button
                className="proxima-hub-compare-zoom-btn"
                onClick={handleZoomIn}
                aria-label="Zoom in"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

