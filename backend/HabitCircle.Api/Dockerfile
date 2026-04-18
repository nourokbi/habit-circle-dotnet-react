# syntax=docker/dockerfile:1

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY backend/HabitCircle.Api/HabitCircle.Api.csproj backend/HabitCircle.Api/
RUN dotnet restore backend/HabitCircle.Api/HabitCircle.Api.csproj

# Copy the rest of the source
COPY backend/HabitCircle.Api/ backend/HabitCircle.Api/

WORKDIR /src/backend/HabitCircle.Api
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# Render will route traffic to the port you configure (set it to 8080)
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "HabitCircle.Api.dll"]
