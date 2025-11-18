import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
      } else if (requireAdmin && !isAdmin) {
        navigate('/');
      }
    }
  }, [user, isAdmin, loading, navigate, requireAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <div className="animate-pulse space-y-4">
              <Lock className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Verificando permissões...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user || (requireAdmin && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
};
