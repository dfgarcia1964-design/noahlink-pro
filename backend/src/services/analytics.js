/**
 * Advanced Analytics Service
 * Provides insights, recommendations, and usage analytics
 */

class AnalyticsService {
  /**
   * Calculate usage statistics
   */
  calculateUsageStats(events, batteryHistory) {
    const stats = {
      totalEvents: events.length,
      eventTypes: this.countEventTypes(events),
      batteryStats: this.calculateBatteryStats(batteryHistory),
      usagePatterns: this.analyzeUsagePatterns(events),
      deviceHealth: this.assessDeviceHealth(events, batteryHistory)
    };

    return stats;
  }

  /**
   * Count events by type
   */
  countEventTypes(events) {
    const counts = {};
    events.forEach(event => {
      counts[event.type] = (counts[event.type] || 0) + 1;
    });
    return counts;
  }

  /**
   * Calculate battery statistics
   */
  calculateBatteryStats(batteryHistory) {
    if (batteryHistory.length === 0) {
      return {
        current: 0,
        average: 0,
        min: 0,
        max: 0,
        drainRate: 0,
        health: 'unknown'
      };
    }

    const levels = batteryHistory.map(h => h.level);
    const current = levels[levels.length - 1];
    const average = Math.round(levels.reduce((a, b) => a + b) / levels.length);
    const min = Math.min(...levels);
    const max = Math.max(...levels);

    // Calculate drain rate
    let drainRate = 0;
    if (batteryHistory.length > 1) {
      const firstTime = new Date(batteryHistory[0].timestamp).getTime();
      const lastTime = new Date(batteryHistory[batteryHistory.length - 1].timestamp).getTime();
      const hoursDiff = (lastTime - firstTime) / (1000 * 60 * 60);
      if (hoursDiff > 0) {
        drainRate = ((batteryHistory[0].level - current) / hoursDiff).toFixed(2);
      }
    }

    // Health assessment
    let health = 'excellent';
    if (current < 20) health = 'critical';
    else if (current < 50) health = 'warning';
    else if (current < 75) health = 'good';

    return {
      current,
      average,
      min,
      max,
      drainRate: parseFloat(drainRate),
      health
    };
  }

  /**
   * Analyze usage patterns
   */
  analyzeUsagePatterns(events) {
    const patterns = {
      mostUsedFeature: this.getMostUsedFeature(events),
      usageFrequency: this.calculateUsageFrequency(events),
      peakUsageTime: this.findPeakUsageTime(events),
      errorsCount: events.filter(e => e.severity === 'error' || e.severity === 'critical').length,
      consecutiveErrors: this.detectConsecutiveErrors(events)
    };

    return patterns;
  }

  /**
   * Get most used feature
   */
  getMostUsedFeature(events) {
    const counts = {};
    events.forEach(event => {
      if (event.type !== 'error') {
        counts[event.type] = (counts[event.type] || 0) + 1;
      }
    });

    let maxType = null;
    let maxCount = 0;
    Object.entries(counts).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxType = type;
      }
    });

    return { type: maxType, count: maxCount };
  }

  /**
   * Calculate usage frequency (events per day)
   */
  calculateUsageFrequency(events) {
    if (events.length === 0) return 0;

    const firstTime = new Date(events[0].timestamp).getTime();
    const lastTime = new Date(events[events.length - 1].timestamp).getTime();
    const daysDiff = (lastTime - firstTime) / (1000 * 60 * 60 * 24);

    if (daysDiff <= 0) return events.length;
    return Math.round(events.length / daysDiff * 10) / 10;
  }

  /**
   * Find peak usage time (hour of day)
   */
  findPeakUsageTime(events) {
    const hourCounts = {};
    events.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    let peakHour = 0;
    let maxCount = 0;
    Object.entries(hourCounts).forEach(([hour, count]) => {
      if (count > maxCount) {
        maxCount = count;
        peakHour = parseInt(hour);
      }
    });

    return { hour: peakHour, count: maxCount };
  }

  /**
   * Detect consecutive errors
   */
  detectConsecutiveErrors(events) {
    let maxConsecutive = 0;
    let currentConsecutive = 0;

    events.forEach(event => {
      if (event.severity === 'error' || event.severity === 'critical') {
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 0;
      }
    });

    return maxConsecutive;
  }

  /**
   * Assess overall device health
   */
  assessDeviceHealth(events, batteryHistory) {
    const errorCount = events.filter(e => e.severity === 'error' || e.severity === 'critical').length;
    const batteryStats = this.calculateBatteryStats(batteryHistory);

    let health = 100;

    // Deduct for errors
    health -= errorCount * 5;

    // Deduct for battery health
    if (batteryStats.health === 'critical') health -= 30;
    else if (batteryStats.health === 'warning') health -= 15;
    else if (batteryStats.health === 'good') health -= 5;

    // Deduct for high drain rate
    if (batteryStats.drainRate > 5) health -= 10;

    return Math.max(0, Math.min(100, health));
  }

  /**
   * Generate smart recommendations
   */
  generateRecommendations(stats, programs, batteryHistory) {
    const recommendations = [];

    // Battery recommendations
    if (stats.deviceHealth.battery === 'critical') {
      recommendations.push({
        priority: 'high',
        icon: '🔴',
        title: 'Batería Crítica',
        message: 'Carga tu dispositivo lo antes posible',
        action: 'charge_device'
      });
    } else if (stats.deviceHealth.battery === 'warning') {
      recommendations.push({
        priority: 'medium',
        icon: '🟡',
        title: 'Batería Baja',
        message: 'Considera cargar en las próximas horas',
        action: 'charge_device'
      });
    }

    // Drain rate recommendations
    if (stats.batteryStats.drainRate > 5) {
      recommendations.push({
        priority: 'medium',
        icon: '⚡',
        title: 'Alto Consumo de Batería',
        message: 'Tu dispositivo está consumiendo mucha batería. Reduce el volumen o usa un programa de bajo consumo.',
        action: 'optimize_battery'
      });
    }

    // Error recommendations
    if (stats.usagePatterns.errorsCount > 5) {
      recommendations.push({
        priority: 'high',
        icon: '⚠️',
        title: 'Múltiples Errores Detectados',
        message: 'Se han detectado varios errores. Reinicia el dispositivo.',
        action: 'restart_device'
      });
    }

    // Program usage recommendations
    if (stats.usagePatterns.mostUsedFeature.type === 'volume_changed') {
      recommendations.push({
        priority: 'low',
        icon: '🎵',
        title: 'Tip: Usa Programas',
        message: 'En lugar de ajustar solo el volumen, prueba usar diferentes programas para mejor audición.',
        action: 'try_programs'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityMap = { high: 0, medium: 1, low: 2 };
      return priorityMap[a.priority] - priorityMap[b.priority];
    });
  }

  /**
   * Generate insights summary
   */
  generateInsights(stats) {
    const insights = [];

    // Battery insight
    const batteryTrend = stats.batteryStats.drainRate > 2 ? 'está drenando rápidamente' : 'está drenando normalmente';
    insights.push({
      type: 'battery',
      text: `Tu batería ${batteryTrend} (${stats.batteryStats.drainRate}%/hora)`,
      icon: '🔋'
    });

    // Usage insight
    insights.push({
      type: 'usage',
      text: `Usas tu dispositivo ${stats.usagePatterns.usageFrequency} veces al día`,
      icon: '📊'
    });

    // Peak time insight
    const peakHour = stats.usagePatterns.peakUsageTime.hour;
    const ampm = peakHour >= 12 ? 'PM' : 'AM';
    const displayHour = peakHour > 12 ? peakHour - 12 : (peakHour === 0 ? 12 : peakHour);
    insights.push({
      type: 'usage_time',
      text: `Tu hora de mayor uso es alrededor de las ${displayHour}:00 ${ampm}`,
      icon: '⏰'
    });

    // Feature insight
    if (stats.usagePatterns.mostUsedFeature.type) {
      insights.push({
        type: 'feature',
        text: `Tu función más utilizada es ${stats.usagePatterns.mostUsedFeature.type.replace(/_/g, ' ')}`,
        icon: '⭐'
      });
    }

    return insights;
  }

  /**
   * Calculate program recommendations
   */
  recommendPrograms(events, batteryHistory) {
    const recommendations = [];

    // Analyze which programs were used most
    const programChanges = events.filter(e => e.type === 'program_switched');
    const programCounts = {};

    programChanges.forEach(event => {
      const program = event.data?.program || 'unknown';
      programCounts[program] = (programCounts[program] || 0) + 1;
    });

    // Get top programs
    const sortedPrograms = Object.entries(programCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    sortedPrograms.forEach(([program, count]) => {
      recommendations.push({
        program,
        usageCount: count,
        recommendation: `Usas este programa frecuentemente (${count} veces)`
      });
    });

    return recommendations;
  }
}

module.exports = new AnalyticsService();
