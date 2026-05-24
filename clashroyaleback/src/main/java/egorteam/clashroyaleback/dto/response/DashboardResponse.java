package egorteam.clashroyaleback.dto.response;

import java.util.Map;

public record DashboardResponse(String playerTag, Map<String, Object> summary, Map<String, Object> charts) {
}

