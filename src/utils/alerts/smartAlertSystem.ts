
/**
 * Sistema de Alertas Inteligentes
 * Filtra e prioriza alertas baseado em qualidade e timing
 */

export interface SmartAlert {
  id: string;
  timestamp: Date;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  type: "SIGNAL" | "RISK" | "MARKET" | "SYSTEM";
  title: string;
  message: string;
  signal?: any;
  actionRequired: boolean;
  expiresAt: Date;
  conditions: string[];
}

export interface AlertFilter {
  minConfidence: number;
  minConfluences: number;
  maxRiskLevel: "LOW" | "MEDIUM" | "HIGH";
  timeframes: string[];
  marketTypes: string[];
  enabledTypes: ("SIGNAL" | "RISK" | "MARKET" | "SYSTEM")[];
}

const DEFAULT_FILTER: AlertFilter = {
  minConfidence: 75,
  minConfluences: 3,
  maxRiskLevel: "MEDIUM",
  timeframes: ["30s", "1m", "5m"],
  marketTypes: ["forex", "otc", "crypto"],
  enabledTypes: ["SIGNAL", "RISK", "SYSTEM"]
};

export class SmartAlertManager {
  private alerts: SmartAlert[] = [];
  private filter: AlertFilter;
  private callbacks: ((alert: SmartAlert) => void)[] = [];
  
  constructor(filter: AlertFilter = DEFAULT_FILTER) {
    this.filter = filter;
  }
  
  public processSignal(signal: any): SmartAlert | null {
    // Filtrar sinais de baixa qualidade
    if (signal.confidence < this.filter.minConfidence) return null;
    if (signal.confluences < this.filter.minConfluences) return null;
    if (!this.filter.timeframes.includes(signal.timeframe)) return null;
    
    const priority = this.calculatePriority(signal);
    const alert = this.createSignalAlert(signal, priority);
    
    // Verificar se já existe alerta similar recente
    if (this.isDuplicateAlert(alert)) return null;
    
    this.addAlert(alert);
    return alert;
  }
  
  public processRiskAlert(riskAssessment: any): SmartAlert | null {
    if (riskAssessment.totalRisk === "EXTREME") {
      const alert: SmartAlert = {
        id: `risk_${Date.now()}`,
        timestamp: new Date(),
        priority: "CRITICAL",
        type: "RISK",
        title: "🚨 RISCO EXTREMO DETECTADO",
        message: `Score de risco: ${riskAssessment.riskScore}/100. ${riskAssessment.recommendations.join(". ")}`,
        actionRequired: true,
        expiresAt: new Date(Date.now() + 300000), // 5 minutos
        conditions: riskAssessment.recommendations
      };
      
      this.addAlert(alert);
      return alert;
    }
    
    return null;
  }
  
  private calculatePriority(signal: any): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    let score = 0;
    
    // Pontuação por confiança
    if (signal.confidence >= 90) score += 30;
    else if (signal.confidence >= 80) score += 20;
    else if (signal.confidence >= 70) score += 10;
    
    // Pontuação por confluências
    score += signal.confluences * 8;
    
    // Pontuação por timing
    if (signal.timing?.optimal_entry) score += 15;
    
    // Pontuação por setup grade
    if (signal.professional_analysis?.market_grade === "A") score += 25;
    else if (signal.professional_analysis?.market_grade === "B") score += 15;
    else if (signal.professional_analysis?.market_grade === "C") score += 5;
    
    // Pontuação por timeframe (scalping é mais urgente)
    if (signal.timeframe === "30s") score += 10;
    else if (signal.timeframe === "1m") score += 5;
    
    if (score >= 80) return "CRITICAL";
    if (score >= 60) return "HIGH";
    if (score >= 40) return "MEDIUM";
    return "LOW";
  }
  
  private createSignalAlert(signal: any, priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"): SmartAlert {
    const emoji = signal.action === "BUY" ? "📈" : "📉";
    const gradeEmoji = signal.professional_analysis?.market_grade === "A" ? "🏆" :
                      signal.professional_analysis?.market_grade === "B" ? "🥈" : "🥉";
    
    const title = `${emoji} ${signal.action} ${signal.timeframe} - ${gradeEmoji} Grade ${signal.professional_analysis?.market_grade}`;
    
    const message = `Confiança: ${signal.confidence}% | ` +
                   `Confluências: ${signal.confluences} | ` +
                   `Sucesso esperado: ${signal.expected_success_rate}% | ` +
                   `Timing: ${signal.timing?.enter_now ? "AGORA" : `${signal.timing?.wait_seconds}s`}`;
    
    return {
      id: `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      priority,
      type: "SIGNAL",
      title,
      message,
      signal,
      actionRequired: priority === "HIGH" || priority === "CRITICAL",
      expiresAt: new Date(Date.now() + (signal.time_validity * 1000)),
      conditions: signal.reasoning || []
    };
  }
  
  private isDuplicateAlert(newAlert: SmartAlert): boolean {
    const recentAlerts = this.alerts.filter(alert => 
      Date.now() - alert.timestamp.getTime() < 60000 && // Últimos 60 segundos
      alert.type === newAlert.type
    );
    
    if (newAlert.type === "SIGNAL" && newAlert.signal) {
      return recentAlerts.some(alert => 
        alert.signal?.action === newAlert.signal?.action &&
        alert.signal?.timeframe === newAlert.signal?.timeframe
      );
    }
    
    return false;
  }
  
  private addAlert(alert: SmartAlert): void {
    this.alerts.push(alert);
    
    // Limpar alertas expirados
    this.cleanExpiredAlerts();
    
    // Notificar callbacks
    this.callbacks.forEach(callback => callback(alert));
    
    console.log(`🔔 Novo alerta ${alert.priority}: ${alert.title}`);
  }
  
  private cleanExpiredAlerts(): void {
    const now = Date.now();
    this.alerts = this.alerts.filter(alert => alert.expiresAt.getTime() > now);
  }
  
  public getActiveAlerts(): SmartAlert[] {
    this.cleanExpiredAlerts();
    return this.alerts.sort((a, b) => {
      const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }
  
  public subscribe(callback: (alert: SmartAlert) => void): void {
    this.callbacks.push(callback);
  }
  
  public updateFilter(newFilter: Partial<AlertFilter>): void {
    this.filter = { ...this.filter, ...newFilter };
    console.log("🔧 Filtros de alerta atualizados:", this.filter);
  }
}

export const alertManager = new SmartAlertManager();
