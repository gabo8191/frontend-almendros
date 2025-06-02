/// <reference types="vitest/globals" />
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DashboardCard from '../../../../../src/features/portal/components/dashboard/DashboardCard.tsx .tsx';
import { type LucideIcon } from 'lucide-react'; // Import the type

// A simple mock for a Lucide icon
const MockIconComponent = (props: React.SVGProps<SVGSVGElement>) => (
  <svg data-testid="mock-lucide-icon" {...props} />
);

const defaultProps = {
  title: 'Test Title',
  value: 'Test Value',
  subtitle: 'Test Subtitle',
  icon: MockIconComponent as unknown as LucideIcon, // Cast to satisfy the prop type
  color: 'blue' as const,
  onClick: vi.fn(),
  isLoading: false,
};

describe('DashboardCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset defaultProps.onClick mock if it's stateful across tests, though vi.fn() is usually fine.
    defaultProps.onClick = vi.fn(); 
  });

  it('should render correctly with all props', () => {
    render(<DashboardCard {...defaultProps} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Value')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    expect(screen.getByTestId('mock-lucide-icon')).toBeInTheDocument();
    expect(screen.getByText('Ver más')).toBeInTheDocument();

    const cardElement = screen.getByText('Test Title').closest('div[class*="bg-gradient-to-br"]');
    expect(cardElement).toHaveClass('from-blue-300'); 
  });

  it('should render correctly without subtitle', () => {
    render(<DashboardCard {...defaultProps} subtitle={undefined} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Value')).toBeInTheDocument();
    expect(screen.queryByText('Test Subtitle')).not.toBeInTheDocument();
  });

  it('should render correctly without onClick handler', () => {
    render(<DashboardCard {...defaultProps} onClick={undefined} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.queryByText('Ver más')).not.toBeInTheDocument();
    const cardElement = screen.getByText('Test Title').closest('div[class*="bg-gradient-to-br"]');
    // The component applies hover effects via cn, so checking for absence of 'cursor-pointer' might be tricky if other classes imply it.
    // Instead, we rely on "Ver más" not being present as a primary indicator.
    // However, the base DashboardCard explicitly adds 'cursor-pointer' based on onClick
    expect(cardElement).not.toHaveClass('cursor-pointer');
  });

  it('should call onClick handler when clicked', () => {
    // Use a fresh mock for this specific test to ensure isolation
    const specificOnClickMock = vi.fn();
    render(<DashboardCard {...defaultProps} onClick={specificOnClickMock} />); 
    const cardElement = screen.getByText('Test Title').closest('div[class*="bg-gradient-to-br"]');
    if (cardElement) fireEvent.click(cardElement);
    expect(specificOnClickMock).toHaveBeenCalledTimes(1);
  });

  it('should render loading state correctly', () => {
    render(<DashboardCard {...defaultProps} isLoading={true} />);
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Value')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-lucide-icon')).not.toBeInTheDocument();

    const loadingContainer = screen.getByText((content, element) => {
        // The loading skeleton is a div with class animate-pulse
        return element?.tagName.toLowerCase() === 'div' && element.classList.contains('animate-pulse');
    });
    expect(loadingContainer).toBeInTheDocument();
    const skeletonBlocks = loadingContainer.querySelectorAll('div[class*="bg-gray-200"]');
    expect(skeletonBlocks.length).toBeGreaterThan(0);
  });
  
  it('should apply correct classes for a different color (e.g., green)', () => {
    render(<DashboardCard {...defaultProps} color="green" />);
    const cardElement = screen.getByText('Test Title').closest('div[class*="bg-gradient-to-br"]');
    expect(cardElement).toHaveClass('from-green-300');
    
    // The icon itself is passed to DashboardCard, which then applies its own classes.
    // We check the classes on the rendered mock icon.
    const iconElement = screen.getByTestId('mock-lucide-icon');
    expect(iconElement).toHaveClass('text-green-500'); 
    
    // Check the container of the icon for its background
    const iconContainer = iconElement.parentElement; // The Icon is wrapped in a div
    expect(iconContainer).toHaveClass('bg-green-50');
  });

}); 