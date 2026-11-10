import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { NotFound } from '../../pages/NotFound';
import { ShieldCheck, Lock, ArrowRight, Loader2 } from 'lucide-react';

interface MasterRouteGuardProps {
  children: React.ReactNode;
}

export const MasterRouteGuard: React.FC<MasterRouteGuardProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [isMaster, setIsMaster] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Formulario de login seguro
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // Forzar refresco para obtener los custom claims más recientes
          const tokenResult = await user.getIdTokenResult(true);
          const hasMasterClaim = Boolean(tokenResult.claims.masterAdmin);
          setIsMaster(hasMasterClaim);
        } catch (err) {
          console.error('Error verificando custom claims:', err);
          setIsMaster(false);
        }
      } else {
        setIsMaster(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleMasterLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError(false);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const tokenResult = await userCredential.user.getIdTokenResult(true);

      if (tokenResult.claims.masterAdmin) {
        setIsMaster(true);
        setCurrentUser(userCredential.user);
      } else {
        // Usuario autenticado pero sin claim masterAdmin -> rechazar inmediatamente
        await signOut(auth);
        setIsMaster(false);
        setAuthError(true);
      }
    } catch (error) {
      setAuthError(true);
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        <span className="text-xs font-semibold text-slate-400 mt-3">Verificando autorización...</span>
      </div>
    );
  }

  // 1. Si el usuario ya está autenticado y tiene el custom claim masterAdmin
  if (currentUser && isMaster) {
    return <>{children}</>;
  }

  // 2. Si falló la autenticación o el usuario no tiene permisos: mostrar 404 estándar sin dar pistas
  if (authError) {
    return <NotFound />;
  }

  // 3. Formulario de ingreso discreto para el Master Admin
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-7 shadow-2xl animate-in fade-in duration-200">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-orange-600/20 text-orange-500 flex items-center justify-center mb-3 border border-orange-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-base font-extrabold text-white tracking-wide">
            Autenticación de Núcleo
          </h2>
          <p className="text-[11px] text-slate-400 mt-1">
            Se requiere token de acceso criptográfico con privilegios Master.
          </p>
        </div>

        <form onSubmit={handleMasterLogin} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Credencial Master</label>
            <input
              type="email"
              required
              placeholder="master@restosuite.internal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Llave de Acceso</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isAuthenticating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verificando...</span>
              </>
            ) : (
              <>
                <span>Validar Claim & Desencriptar</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-3 border-t border-slate-800/80 text-center">
          <button
            onClick={() => setAuthError(true)}
            className="text-[11px] text-slate-500 hover:text-slate-400 transition cursor-pointer"
          >
            Cancelar y salir
          </button>
        </div>
      </div>
    </div>
  );
};
