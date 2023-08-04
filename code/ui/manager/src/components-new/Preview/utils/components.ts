import { styled } from '@storybook/theming';
import { Link } from '@storybook/router';
import { BREAKPOINT } from '../../Layout/_constants';

export const FrameWrap = styled.div<{ offset: number }>(({ offset }) => ({
  position: 'absolute',
  overflow: 'auto',
  left: 0,
  right: 0,
  bottom: 0,
  top: offset,
  zIndex: 3,
  transition: 'all 0.1s linear',
  height: `calc(100% - ${offset + 40}px)`,
  background: 'transparent',

  [`@media (min-width: ${BREAKPOINT}px)`]: {
    height: `calc(100% - ${offset}px)`,
  },
}));

export const UnstyledLink = styled(Link)({
  color: 'inherit',
  textDecoration: 'inherit',
  display: 'inline-block',
});

export const DesktopOnly = styled.span({
  // Hides full screen icon at mobile breakpoint defined in app.js
  '@media (max-width: 599px)': {
    display: 'none',
  },
});

export const IframeWrapper = styled.div(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  width: '100%',
  height: '100%',
  background: theme.background.content,
}));

export const LoaderWrapper = styled.div(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  background: theme.background.content,
  zIndex: 1,
}));
