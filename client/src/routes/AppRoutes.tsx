import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { HomePage } from '../pages/Home/HomePage';
import { CreateRoomPage } from '../pages/CreateRoom/CreateRoomPage';
import { JoinRoomPage } from '../pages/JoinRoom/JoinRoomPage';
import { GameRoomPage } from '../pages/GameRoom/GameRoomPage';
import { NotFoundPage } from '../pages/NotFound/NotFoundPage';
import { LoginPage } from '../pages/Auth/LoginPage';
import { ProfilePage } from '../pages/Profile/ProfilePage';
import { RoomsPage } from '../pages/Rooms/RoomsPage';
import { GuardedRoute } from './GuardedRoute';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path='/'
          element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          }
        />
        <Route
          path='/create'
          element={
            <MainLayout>
              <GuardedRoute>
                <CreateRoomPage />
              </GuardedRoute>
            </MainLayout>
          }
        />
        <Route
          path='/join'
          element={
            <MainLayout>
              <GuardedRoute>
                <JoinRoomPage />
              </GuardedRoute>
            </MainLayout>
          }
        />
        <Route
          path='/login'
          element={
            <MainLayout>
              <LoginPage />
            </MainLayout>
          }
        />
        <Route
          path='/rooms'
          element={
            <MainLayout>
              <GuardedRoute>
                <RoomsPage />
              </GuardedRoute>
            </MainLayout>
          }
        />
        <Route
          path='/profile'
          element={
            <MainLayout>
              <GuardedRoute>
                <ProfilePage />
              </GuardedRoute>
            </MainLayout>
          }
        />
        <Route
          path='/room/:roomCode'
          element={
            <MainLayout>
              <GuardedRoute>
                <GameRoomPage />
              </GuardedRoute>
            </MainLayout>
          }
        />
        <Route path='/404' element={<NotFoundPage />} />
        <Route path='*' element={<Navigate replace to='/404' />} />
      </Routes>
    </BrowserRouter>
  );
}
