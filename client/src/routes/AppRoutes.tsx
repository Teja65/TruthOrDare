import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { HomePage } from '../pages/Home/HomePage';
import { CreateRoomPage } from '../pages/CreateRoom/CreateRoomPage';
import { JoinRoomPage } from '../pages/JoinRoom/JoinRoomPage';
import { GameRoomPage } from '../pages/GameRoom/GameRoomPage';
import { NotFoundPage } from '../pages/NotFound/NotFoundPage';

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
              <CreateRoomPage />
            </MainLayout>
          }
        />
        <Route
          path='/join'
          element={
            <MainLayout>
              <JoinRoomPage />
            </MainLayout>
          }
        />
        <Route
          path='/room'
          element={
            <MainLayout>
              <GameRoomPage />
            </MainLayout>
          }
        />
        <Route path='/404' element={<NotFoundPage />} />
        <Route path='*' element={<Navigate replace to='/404' />} />
      </Routes>
    </BrowserRouter>
  );
}
